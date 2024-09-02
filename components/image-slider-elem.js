const imageSliderTemplate = document.createElement("template");
imageSliderTemplate.innerHTML = `
    <style>
        :host {
            --width: 1280px;
            --height: 720px;
            --button-diameter: 50px;

            display: inline-block;
            width: var(--width);
            height: var(--height);
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
            height: var(--height);

            display: flex;
            position: absolute;
            left: 0px;
            z-index: 0;

            transition: 0.5s;
        }

        .slides > img {
            width: var(--width);
            height: var(--height);
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
    </style>
    <div class="slider-container">
        <div id="slides" class="slides"></div>
        <div class="button-container">
            <button id="prev"><</button>
            <button id="next">></button>
        </div>
    </div>
`;

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
        this.next.onclick = () => this.slide(1);
        this.prev.onclick = () => this.slide(-1);
        let width_var = getComputedStyle(this.host).getPropertyValue('--width');
        this.slide_width = Number(width_var.substring(0, width_var.length - 2));
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

    slideTo(pos) {
        this.active = Math.max(pos, 0) % this.images.length;

        let width_var = getComputedStyle(this.host).getPropertyValue('--width');
        let slide_width = Number(width_var.substring(0, width_var.length - 2));

        this.slides.style.left = `${-slide_width*this.active}px`;
    }

    slide(dir) {
        this.slideTo((this.active + dir + this.images.length) % this.images.length);
    }
}

customElements.define("image-slider-elem", ImageSlider);
