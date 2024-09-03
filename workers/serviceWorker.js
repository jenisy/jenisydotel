// Note: Update 'resVer' when updating resources
const resVer = "0.0.2";

// Note: find by running:
// `git ls-tree -r <branch_name> --name-only | awk '{ printf "\"/%s\",\n", $1 }'`
// Add parent dirs containing `index.html`
// And ignore any files that don't need to be cached (i.e. serviceWorker.js)
const resources = [
    // Manual
    "/",
    "/illustrations/",

    // Auto: using above cmd (and removing ones to be ignored)
    // "/404.html",  //TODO: add
    "/assets/favicon.png",
    "/assets/home/0.png",
    "/assets/home/1.png",
    "/assets/home/2.png",
    "/assets/home/3.png",
    "/assets/home/4.png",
    "/assets/home/5.png",
    "/assets/home/6.png",
    "/assets/home/7.png",
    "/assets/home/hero_bg.png",
    "/assets/illustrations/art_fight_0.jpg",
    "/assets/illustrations/astarion.jpg",
    "/assets/illustrations/com_0.jpg",
    "/assets/illustrations/farcille.png",
    "/assets/illustrations/leon.jpg",
    "/assets/illustrations/toji.jpg",
    "/assets/storyboards/storyboard_0/0.png",
    "/components/copyright-elem.js",
    "/components/gallery-elem.js",
    "/components/image-slider-elem.js",
    "/components/storyboard-elem.js",
    "/illustrations/index.html",
    "/index.html",
    "/main.js",
    "/robots.txt",
    "/styles.css",
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
