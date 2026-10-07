self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open("sorteio-cache-v2").then(function (cache) {
      return cache.addAll(["./", "./index.html"]);
    })
  );
});

self.addEventListener("fetch", function (e) {
  if (
    e.request.method !== "GET" ||
    new URL(e.request.url).origin !== self.location.origin
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(function (response) {
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open("sorteio-cache-v2").then(function (cache) {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(function () {
        return caches.match(e.request).then(function (response) {
          if (response) return response;
          if (e.request.mode === "navigate") return caches.match("./index.html");
          return Response.error();
        });
      })
  );
});
