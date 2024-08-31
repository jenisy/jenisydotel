const imageSliderTemplate = document.createElement("template");
imageSliderTemplate.innerHTML = `
    <style>
        .slider {
            --width: 1300px;
            --height: 700px;
            --button-diameter: 50px;

            width: var(--width);
            max-width: 100vw;
            height: var(--height);

            margin: auto;
            position: relative;
            overflow: hidden;

            background-color: black;
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
            width: var(--width);
            max-width: 100vw;
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
    <div class="slider">
        <div class="list"></div>
        <div class="buttons">
            <button id="prev"><</button>
            <button id="next">></button>
        </div>
    </div>
`;

class ImageSlider extends HTMLElement {
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
        return images_str.split(",");
    }

    set images(val) {
        this.setAttribute("images", val);
    }

    connectedCallback() {
        this.next.onclick = () => this.slide(1);
        this.prev.onclick = () => this.slide(-1);
        this.shadowRoot.addEventListener("resize", () => this.slide(0));
        
        this.updateSlider();
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

    slide(dir) {
        this.active = (this.active + dir + this.images.length) % this.images.length;
        this.slider.style.left = `${-this.image_elems[this.active].offsetLeft}px`;
    }
}

customElements.define("image-slider-elem", ImageSlider);
