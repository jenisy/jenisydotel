const storyboardTemplate = document.createElement("template");
storyboardTemplate.innerHTML = `
    <style>
        :host {
            display: grid;
            place-items: center;
        }

        .storyboard-description {
            padding: 10% 0px 0px 10%;

            grid-area: sbc-a;
        }

        .storyboard-embed {
            min-width: 600px;
            min-height: 400px;

            grid-area: sbc-b;
        }

        .storyboard-gallery {
            grid-area: sbc-c;
        }

        .storyboard-container {
            width: 60%;

            display: grid;
            gap: 10px;
            place-items: center;
            grid-template:
                'sbc-a sbc-b'
                'sbc-a sbc-b'
                'sbc-c sbc-c';
        }

        @media (width < 1600px) {
            .storyboard-container {
                grid-template:
                    'sbc-a'
                    'sbc-b'
                    'sbc-c';
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
        <div id="storyboard_description" class="storyboard-description">
            <slot name="storyboard-description">DESCRIPTION NEEDED</slot>
        </div>
        <div id="storyboard_embed" class="storyboard-embed">
            <slot name="storyboard-embed">EMBED NEEDED</slot>
        </div>
        <div id="storyboard_gallery" class="storyboard-gallery">
        </div>
    </div>
`;

class Storyboard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(storyboardTemplate.content.cloneNode(true));
    }
}

customElements.define("storyboard-elem", Storyboard);
