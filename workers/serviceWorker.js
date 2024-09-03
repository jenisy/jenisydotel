// Note: Update 'resVer' when updating resources
const resVer = "0.0.1";
const resources = [
    "/",
    "/404.html",
    "/index.html",

    "/style.css",

    "/main.js",
    "/tickWorker.js",

    "/assets/audio/Perc_Can_hi.wav",
    "/assets/audio/Perc_Can_lo.wav",
];
const cacheName = `resources_v${resVer}`;

const state = {
    reloadOnFetch: false,
};

const addAllToCache = async (requests) => {
    const cache = await caches.open(cacheName);
    await cache.addAll(requests.map((req) => new Request(req, { cache: "reload" })));
};

const putInCache = async (request, response) => {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
};

const cacheFirst = async (request, reloadOnFetch) => {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        if (reloadOnFetch) {
            fetch(new Request(request, { cache: "reload" }))
                .then((res) => putInCache(request, res))
                .catch((_) => { /* Do nothing */ });
        }

        return responseFromCache;
    }

    try {
        const responseFromNetwork = await fetch(request);
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        });
    }
};

self.addEventListener("install", (event) => {
    event.waitUntil(
        // Replace old service worker with new service worker
        // Note: Also fetches all resources
        // refreshing cache if same `resVer` or creating a new one
        self.skipWaiting().then(
            addAllToCache(resources)
        )
    );
});

self.addEventListener("activate", (event) => {
    let asyncActivate = async () => {
        // Transfer ownership of open clients to new service worker
        clients.claim();

        // Remove old cache(s)
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (cacheName !== key) {
                        return caches.delete(key);
                    }
                })
            );
        });
    };
    event.waitUntil(asyncActivate());
});

self.addEventListener("fetch", (event) => {
    event.respondWith(cacheFirst(event.request, state.reloadOnFetch));
});

self.addEventListener("message", (event) => {
    let asyncHandleMessage = async () => {
        switch (event.data.messageType) {
            case "refresh-cache":
                const cache = await caches.open(cacheName);
                const requests = await cache.keys();
                addAllToCache(requests);
                break;
            case "clear-cache":
                await caches.delete(cacheName);
                addAllToCache(resources);
                break;
            case "set-reload-on-fetch":
                state.reloadOnFetch = !!event.data.reloadOnFetch;
                break;
            default:
                console.error(`Error: Unknow Message Type '${event.data.messageType}'`);
        }
    };
    event.waitUntil(asyncHandleMessage());
});
