#!/bin/sh
# Roda todos os testes do projeto.
set -e
TOTAL=0; PASS=0; FAIL=0
for t in $(find src -name "*.test.mjs" | sort); do
  OUT=$(node --experimental-strip-types --import ./src/lib/trilha/_loader-alias-register.mjs --test "$t" 2>&1)
  T=$(echo "$OUT" | grep -oE "^# tests [0-9]+" | grep -oE "[0-9]+")
  P=$(echo "$OUT" | grep -oE "^# pass [0-9]+" | grep -oE "[0-9]+")
  F=$(echo "$OUT" | grep -oE "^# fail [0-9]+" | grep -oE "[0-9]+")
  echo "$t: $P/$T passando, $F falhando"
  TOTAL=$((TOTAL+T)); PASS=$((PASS+P)); FAIL=$((FAIL+F))
done
echo "-----"
echo "TOTAL: $TOTAL testes | $PASS passando | $FAIL falhando"
