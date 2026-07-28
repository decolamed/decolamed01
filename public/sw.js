// Service worker mínimo — existe só para satisfazer o critério de
// instalabilidade de PWA dos navegadores (precisa de um SW ativo com um
// handler de fetch). Não faz cache nem intercepta nada: todo request
// simplesmente segue para a rede normalmente.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {});
