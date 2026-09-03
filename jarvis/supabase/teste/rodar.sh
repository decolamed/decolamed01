#!/bin/sh
# ===========================================================================
# Roda o schema.sql de verdade num Postgres descartável e confere a RLS.
#
# Por que isto existe: as regras de isolamento entre usuários são a única parte
# do projeto que o TypeScript não consegue verificar. Uma policy escrita errada
# compila, sobe e só aparece no dia em que um aluno enxerga a tutoria de outro.
#
#   ./supabase/teste/rodar.sh      (ou: npm run test:banco)
#
# Precisa do PostgreSQL instalado. No Ubuntu/Debian:  sudo apt install postgresql
# No Mac, com Homebrew:                               brew install postgresql@16
# ===========================================================================
set -e

AQUI=$(cd "$(dirname "$0")" && pwd)
PORTA=${PORTA_TESTE:-5499}
PASTA=$(mktemp -d)
SOQUETE=$PASTA/soquete

# O Postgres não fica no PATH em toda instalação — procura nos lugares usuais.
if command -v initdb >/dev/null 2>&1; then
  BIN=$(dirname "$(command -v initdb)")
else
  BIN=$(ls -d /usr/lib/postgresql/*/bin /opt/homebrew/opt/postgresql*/bin \
        /usr/local/opt/postgresql*/bin 2>/dev/null | sort -r | head -1)
fi

if [ -z "$BIN" ] || [ ! -x "$BIN/initdb" ]; then
  echo "Não achei o PostgreSQL nesta máquina."
  echo "  Ubuntu/Debian: sudo apt install postgresql"
  echo "  Mac:           brew install postgresql@16"
  exit 1
fi

# O Postgres se recusa a rodar como root. Quando este script roda como root
# (contêiner, CI), delega para um usuário sem privilégio.
COMO=""
if [ "$(id -u)" = "0" ]; then
  id postgres >/dev/null 2>&1 || useradd -m postgres
  chown -R postgres "$PASTA"
  COMO="su postgres -c"
fi

rodar() {
  if [ -n "$COMO" ]; then
    su postgres -c "$1"
  else
    sh -c "$1"
  fi
}

limpar() {
  rodar "$BIN/pg_ctl -D $PASTA/dados stop -m immediate" >/dev/null 2>&1 || true
  rm -rf "$PASTA"
}
trap limpar EXIT INT TERM

mkdir -p "$SOQUETE"
[ -n "$COMO" ] && chown -R postgres "$PASTA"

echo "Subindo um Postgres descartável..."
rodar "$BIN/initdb -D $PASTA/dados -U postgres --auth=trust" >/dev/null 2>&1
rodar "$BIN/pg_ctl -D $PASTA/dados -l $PASTA/log -o '-p $PORTA -k $SOQUETE' start" >/dev/null

# O `pg_ctl start` volta antes de o servidor aceitar conexão.
i=0
until "$BIN/pg_isready" -h "$SOQUETE" -p "$PORTA" >/dev/null 2>&1; do
  i=$((i + 1))
  [ "$i" -gt 30 ] && { echo "O Postgres não subiu:"; cat "$PASTA/log"; exit 1; }
  sleep 1
done

psql() { "$BIN/psql" -h "$SOQUETE" -p "$PORTA" -U postgres "$@"; }

psql -q -c "create database jarvis_teste;"
psql -q -d jarvis_teste -v ON_ERROR_STOP=1 -f "$AQUI/00-simular-supabase.sql"

echo "Aplicando o schema.sql..."
psql -q -d jarvis_teste -v ON_ERROR_STOP=1 -f "$AQUI/../schema.sql" 2>&1 | grep -v "NOTICE" || true

echo "Testando o isolamento entre usuários..."
psql -d jarvis_teste -v ON_ERROR_STOP=1 -f "$AQUI/01-rls.sql" 2>&1 \
  | grep -v "^$" | sed 's/^psql:[^ ]* //'
