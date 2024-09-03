import '../components/copyright-elem.js';
import '../components/gallery-elem.js';
import '../components/image-slider-elem.js';
import '../components/storyboard-elem.js';

async function registerServiceWorker() {
  if (navigator && "serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/workers/serviceWorker.js", { scope: "/" });
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};
registerServiceWorker();
