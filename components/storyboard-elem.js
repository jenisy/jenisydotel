import '/components/gallery-elem.js';

const storyboardTemplate = document.createElement("template");
storyboardTemplate.innerHTML = `
    <style>
        :host {
            display: grid;
            place-items: center;
        }

        .storyboard-header {
            grid-area: sbc-a;

            font-family: 'Amatic SC', Arial;
            font-weight: 700;
            font-size: 80px;
        }

        .storyboard-description {
            grid-area: sbc-b;

            /* padding: 10% 0px 0px 10%; */
            font-family: Arial;
        }

        .storyboard-embed {
            grid-area: sbc-c;

            min-width: 600px;
            min-height: 400px;
        }

        .storyboard-gallery {
            grid-area: sbc-d;
        }

        .storyboard-container {
            width: 60%;

            display: grid;
            gap: 10px;
            place-items: center;
            grid-template:
                'sbc-a sbc-c'
                'sbc-b sbc-c'
                'sbc-d sbc-d';
        }

        .gallery {
            --gap: 0px;
            --num-cols: 6;
            --row-height: 180px;
            --col-width: 180px;
        }

        @media (width < 1600px) {
            .storyboard-container {
                grid-template:
                    'sbc-a'
                    'sbc-b'
                    'sbc-c'
                    'sbc-d';
            }
            .storyboard-description {
                width: 90%;
                padding: 0px;
            }
            .storyboard-embed {
                width: 80%;
                min-width: 0px;
                min-height: 0px;
            }
            .gallery {
                --row-height: 140px;
                --col-width: 140px;
            }
        }

        @media (width < 1000px) {
            .storyboard-header {
                font-size: 40px;
            }
        }

        @media (width < 800px) {
            .storyboard-container {
                width: 90%;
            }
            .storyboard-embed {
                width: 90%;
                min-width: 0px;
                min-height: 0px;
            }
        }
    </style>
    <div id="storyboard_container" class="storyboard-container">
        <div id="storyboard_header" class="storyboard-header">
            <slot name="storyboard-header">HEADER NEEDED</slot>
        </div>
        <div id="storyboard_description" class="storyboard-description">
            <slot name="storyboard-description">DESCRIPTION NEEDED</slot>
        </div>
        <div id="storyboard_embed" class="storyboard-embed">
            <slot name="storyboard-embed">EMBED NEEDED</slot>
        </div>
        <div id="storyboard_gallery" class="storyboard-gallery">
            <gallery-elem id="gallery" class="gallery"></gallery-elem>
        </div>
    </div>
`;

class Storyboard extends HTMLElement {
    static observedAttributes = ["images"];

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(storyboardTemplate.content.cloneNode(true));

        this.gallery = this.shadowRoot.getElementById("gallery");
    }

    get images() {
        let images_str = this.getAttribute("images");
        return images_str.split(",");
    }

    set images(val) {
        this.setAttribute("images", val);
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
        this.gallery.images = this.images.join(",");
    }
}

customElements.define("storyboard-elem", Storyboard);
