import '/components/image-slider-elem.js';

const galleryTemplate = document.createElement("template");
galleryTemplate.innerHTML = `
    <style>
        .gallery {
            /* Settable Vars */
            --gap: 16px;
            --num-cols: 3;
            --row-height: 300px;
            --col-width: 300px;

            /* Derived Vars */
            --padding: var(--gap);
            --num-gaps-horizontal: calc(var(--num-cols) - 1);
            --gallery-content-width: calc(var(--num-cols) * var(--col-width));
            --gallery-gap-width: calc(var(--num-gaps-horizontal) * var(--gap));

            width: calc(var(--gallery-content-width) + var(--gallery-gap-width));
            padding: var(--padding);

            display: grid;
            grid-template-columns: repeat(var(--num-cols), var(--col-width));
            grid-auto-rows: var(--row-height);
            gap: var(--gap);

            border-radius: 10px;
            background-color: #DADADA;
        }

        .gallery > img {
            width: 100%;
            height: 100%;
            object-fit: cover;

            cursor: pointer;
        }

        .gallery > img:hover {
            opacity: 0.6;
            /* box-shadow: 0 4px 8px rgba(0,0,0,0.15); */
        }

        /* TODO: animate fade in */
        .modal {
            width: 100%;
            height: 100%;
            padding: 0px;

            border: 0px;
            outline: none;
            background-color: transparent;

            overflow: hidden;
        }

        .modal::backdrop {
            opacity: 0.8;
            background-color: black;
        }

        .modal-content {
            width: 100%;
            height: 100%;

            display: grid;
            place-items: center;
        }

        @media (width < 1600px) {
            .slider {
                --width: 640px;
                --height: 360px;
                --button-diameter: 40px;
            }
        }

        @media (width < 800px) {
            .slider {
                --width: 320px;
                --height: 180px;
                --button-diameter: 30px;
            }
        }
    </style>
    <div id="g_base" class="gallery"></div>
    <dialog id="g_modal" class="modal">
        <div id="g_m_content" class="modal-content">
            <image-slider-elem class="slider" id="g_m_slider"></image-slider-elem>
        </div>
    </dialog>
`;

class Gallery extends HTMLElement {
    static observedAttributes = ["images"];

    constructor() {
        // HTMLElement
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(galleryTemplate.content.cloneNode(true));

        // Vars
        this.gallery = this.shadowRoot.getElementById("g_base");
        this.modal = this.shadowRoot.getElementById("g_modal");
        this.image_slider = this.shadowRoot.getElementById("g_m_slider");
        this.ind = 0;

        // Funcs
        this.openModal = (ind) => {
            this.image_slider.slideTo(ind);
            this.modal.showModal();
        };
        this.closeModal = (e) => {
            if (e.target.id === "g_modal" || e.target.id === "g_m_content") {
                this.modal.close();
            }
        };
    }

    get images() {
        let images_str = this.getAttribute("images");
        return images_str.split(",");
    }

    set images(val) {
        this.setAttribute("images", val);
    }

    connectedCallback() {
        this.updateGallery();
        this.modal.addEventListener("click", this.closeModal);
    }

    disconnectedCallback() {
        this.modal.removeEventListener("click", this.closeModal)
    }

    attributeChangedCallback(attribute, _oldValue, _newValue) {
        switch(attribute) {
            case "images":
                this.updateGallery();
                break;
            default:
                console.log(`Unknown attribute [${attribute}] has changed.`);
        }
    }

    updateGallery() {
        while (this.gallery.firstChild) {
            this.gallery.removeChild(this.gallery.firstChild);
        }
        this.images.forEach((img, ind) => {
            let g_img = document.createElement("img");
            g_img.setAttribute("id", `g_img_${ind}`);
            g_img.setAttribute("src", img);
            g_img.addEventListener("click", () => this.openModal(ind));

            this.gallery.appendChild(g_img);
        })
        this.image_slider.images = this.images.join(",");
    }
}

customElements.define("gallery-elem", Gallery);
