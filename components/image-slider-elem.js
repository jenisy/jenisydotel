const imageSliderTemplate = document.createElement("template");
imageSliderTemplate.innerHTML = `
    <style>
        :host {
            --width: 1280px;
            --height: 720px;
            --button-diameter: 50px;

            display: inline-block;
            width: var(--width);
            height: 100%;
        }

        .slider-container {
            width: 100%;
            height: 100%;

            display: flex;
            align-items: center;
            overflow: hidden;
            position: relative;

            border-radius: 20px;
            background-color: #000000D0;
        }

        .slides {
            width: fit-content;
            height: 100%;

            display: flex;
            position: absolute;
            left: 0px;
            z-index: 0;

            transition: 0.5s;
        }

        .slides > img {
            width: var(--width);
            height: 100%;
            object-fit: contain;
        }

        .button-container {
            width: 100%;
            height: fit-content;
            padding: 2%;

            display: flex;
            position: relative;
            justify-content: space-between;
            z-idex: 1;
        }

        .button-container > button {
            width: var(--button-diameter);
            height: var(--button-diameter);

            border: none;
            border-radius: 50%;

            background-color: #8A8A8A60;

            color: #000000;
            font-family: monospace;
            font-weight: bold;
        }

        .button-container > button:hover {
            background-color: #5A5A5A60;
        }

        @media (orientation: landscape) {
            :host {
                height: var(--height);
            }
        }

        .no-transition {
            transition: 0s;
        }
    </style>
    <div class="slider-container">
        <div id="slides" class="slides"></div>
        <div class="button-container">
            <button id="prev"><</button>
            <button id="next">></button>
        </div>
    </div>
`;

const SWIPE_SPEED_THRESHOLD = 0.75;

class ImageSlider extends HTMLElement {
    static observedAttributes = ["images"];

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(imageSliderTemplate.content.cloneNode(true));

        this.host = this.shadowRoot.host;
        this.slides = this.shadowRoot.getElementById("slides");
        this.image_elems = this.slides.getElementsByTagName("img");
        this.prev = this.shadowRoot.getElementById("prev");
        this.next = this.shadowRoot.getElementById("next");

        this.active = 0;
    }

    get images() {
        let images_str = this.getAttribute("images");
        if (!images_str) {
            return [];
        }

        images_str = images_str.replace(/\s+/g,'');
        return images_str.split(",");
    }

    set images(val) {
        this.setAttribute("images", val);
    }

    connectedCallback() {
        this.prev.addEventListener("click", () => this.slide(-1));
        this.next.addEventListener("click", () => this.slide(1));
        this.addEventListener("touchstart", this.handleTouchStart);
        this.addEventListener("touchend", this.handleTouchEnd);

        this.resizeObserver = new ResizeObserver((_entries) => {
            this.slides.classList.add("no-transition");
            this.updateSlidePos();
            // Trigger a reflow, flushing the CSS changes
            this.slides.offsetHeight;
            this.slides.classList.remove("no-transition");
        });
        this.resizeObserver.observe(this.host);

        this.updateSlidePos();
    }

    attributeChangedCallback(attribute, _oldValue, _newValue) {
        switch(attribute) {
            case "images":
                this.onImagesChanged();
                break;
            default:
                console.log(`Unknown attribute [${attribute}] has changed.`);
        }
    }

    onImagesChanged() {
        while (this.slides.firstChild) {
            this.slides.removeChild(this.slides.firstChild);
        }
        this.images.forEach((img, ind) => {
            let s_img = document.createElement("img");
            s_img.setAttribute("id", `s_img_${ind}`);
            s_img.setAttribute("src", img);

            this.slides.appendChild(s_img);
        })
        this.image_elems = this.slides.getElementsByTagName("img");
    }

    updateSlidePos() {
        let width_var = getComputedStyle(this.host).getPropertyValue('--width');
        let slide_width = Number(width_var.substring(0, width_var.length - 2));

        this.slides.style.left = `${-slide_width*this.active}px`;
    }

    slideTo(pos) {
        this.active = Math.max(pos, 0) % this.images.length;
        this.updateSlidePos();
    }

    slide(dir) {
        this.slideTo((this.active + dir + this.images.length) % this.images.length);
    }

    handleTouchStart(e) {
        this.touchStartData = {
            x: e.changedTouches[0].screenX,
            y: e.changedTouches[0].screenY,
            time: Date.now(),
        };
    }

    handleTouchEnd(e) {
        let deltas = {
            x: e.changedTouches[0].screenX - this.touchStartData.x,
            y: e.changedTouches[0].screenY - this.touchStartData.y,
            time: Date.now() - this.touchStartData.time,
        };

        // Determine what we want to consider a swipe (left or right)
        if (Math.abs(deltas.y) >= Math.abs(deltas.x)) {
            return;  // swipe vertical not horizontal
        }
        if (Math.abs(deltas.x / deltas.time) < SWIPE_SPEED_THRESHOLD) {
            return;  // swipe too slow
        }

        let isLeftSwipe = deltas.x < 0;
        if (isLeftSwipe) {
            this.slide(1);  // Swipe left means go right
        } else {
            this.slide(-1);  // And vice versa
        }
    }
}

customElements.define("image-slider-elem", ImageSlider);
