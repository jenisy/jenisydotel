const imageSliderTemplate = document.createElement("template");
imageSliderTemplate.innerHTML = `
    <style>
        .slider {
            --width: 1300px;
            --height: 700px;
            --button-diameter: 50px;

            /*
            width: var(--width);
            max-width: 100vw;
            height: var(--height);
            */
            width: 100vw;
            height: var(--height);

            margin: auto;
            position: relative;
            overflow: hidden;

            border-radius: 10px;
            background-color: rgba(0, 0, 0, 0.6);
        }
        .slider .list {
            width: max-content;
            height: 100%;

            position: absolute;
            left: 0;
            top: 0;

            display: flex;
            transition: 1s;
        }
        .slider .list img {
            /*
            width: var(--width);
            max-width: 100vw;
            */
            width: 100vw;
            height: 100%;

            object-fit: contain;
        }
        .slider .buttons {
            width: 90%;

            position: absolute;
            top: 45%;
            left: 5%;

            display: flex;
            justify-content: space-between;
        }
        .slider .buttons button {
            width: var(--button-diameter);
            height: var(--button-diameter);

            border: none;
            border-radius: 50%;

            background-color: #FFF5;

            color: #FFF;
            font-family: monospace;
            font-weight: bold;
        }
    </style>
    <div id="image-slider" class="slider">
        <div class="list"></div>
        <div class="buttons">
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

        this.slider = this.shadowRoot.querySelector(".slider .list");
        this.next = this.shadowRoot.getElementById("next");
        this.prev = this.shadowRoot.getElementById("prev");

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
        this.shadowRoot.addEventListener("resize", () => this.slide(0));

        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                let elem = entry.target;
                let bounding = elem.getBoundingClientRect();
                // TODO: avoid divide by 0
                this.slide_width = bounding.width / this.images.length;
                withoutTrans(this.slider, () => this.slide(0));
            }
        });
        this.resizeObserver.observe(this.slider);
    }

    attributeChangedCallback(attribute, _oldValue, _newValue) {
        switch(attribute) {
            case "images":
                this.updateSlider();
                break;
            default:
                console.log(`Unknown attribute [${attribute}] has changed.`);
        }
    }

    updateSlider() {
        while (this.slider.firstChild) {
            this.slider.removeChild(this.slider.firstChild);
        }
        this.images.forEach((img, ind) => {
            let s_img = document.createElement("img");
            s_img.setAttribute("id", `s_img_${ind}`);
            s_img.setAttribute("src", img);

            this.slider.appendChild(s_img);
        })
        this.image_elems = this.shadowRoot.querySelectorAll(".slider .list img");
    }

    slideTo(pos) {
        this.active = Math.max(pos, 0) % this.images.length;
        this.slider.style.left = `${-this.slide_width*this.active}px`;
    }

    slide(dir) {
        this.slideTo((this.active + dir + this.images.length) % this.images.length);
    }
}

function withoutTrans(elem, func) {
    let transProps = ["-webkit-transition-property", "-moz-transition-property", "-o-transition-property", "transition-property"];
    const prevProps = transProps.reduce((prev, prop, _) => (prev[prop] = elem.style[prop], prev), {});
    // This somewhat works, but unsure cause it only applies `transition-property`
    transProps.forEach((prop,_) => {
        console.log(prop, ":", elem.style[prop]);
        elem.style[prop] = "none";
    });
    // elem.style["transition-property"] = "none";
    // console.log(elem.style);
    func();
    elem.offsetHeight;  // Trigger a reflow, flushing the CSS changes
    transProps.forEach((prop,_) => elem.style[prop] = prevProps[prop]);
}

customElements.define("image-slider-elem", ImageSlider);
