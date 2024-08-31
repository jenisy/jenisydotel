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
        }

        .gallery > img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* TODO: animate fade in */
        .modal {
            width: 80%;
            height: 80%;

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
        }

        .modal-content > img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    </style>
    <div id="g_base" class="gallery"></div>
    <dialog id="g_modal" class="modal">
        <div id="g_m_content" class="modal-content"></div>
    </dialog>
`;

class Gallery extends HTMLElement {
    constructor() {
        // HTMLElement
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(galleryTemplate.content.cloneNode(true));

        // Vars
        this.images = [
            "/assets/illustrations/0.jpg",
            "/assets/illustrations/1.jpg",
            "/assets/illustrations/2.jpg",
            "/assets/illustrations/3.jpg",
            "/assets/illustrations/4.jpg",
            "/assets/illustrations/5.jpg",
        ];
        this.gallery = this.shadowRoot.getElementById("g_base");
        this.modal = this.shadowRoot.getElementById("g_modal");
        this.modal_content = this.shadowRoot.getElementById("g_m_content");
        this.ind = 0;

        // Funcs
        this.updateGallery = (ind) => {
            // Clear old content
            while (this.modal_content.firstChild) {
                this.modal_content.removeChild(this.modal_content.firstChild);
            }

            // Set new content
            let img = document.createElement("img");
            img.setAttribute("id", `g_m_c_img_${ind}`);
            img.setAttribute("src", this.images[ind]);
            this.modal_content.appendChild(img);

            // Update state
            this.ind = ind;
        };
        this.openModal = (ind) => {
            this.updateGallery(ind);
            this.modal.showModal();
        };
        this.closeModal = (_e) => {
            // if (e.target.id === "g_modal") {
            //     modal.close();
            // }
            this.modal.close();
        };
    }

    connectedCallback() {
        this.images.forEach((img, ind) => {
            let g_img = document.createElement("img");
            g_img.setAttribute("id", `g_img_${ind}`);
            g_img.setAttribute("src", img);
            g_img.addEventListener("click", () => this.openModal(ind));

            this.gallery.appendChild(g_img);
        })

        this.modal.addEventListener("click", this.closeModal);
    }

    disconnectedCallback() {
        this.modal.removeEventListener("click", this.closeModal)
    }
}

customElements.define("gallery-elem", Gallery);
