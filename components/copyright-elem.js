const copyrightTemplate = document.createElement("template");
copyrightTemplate.innerHTML = `
    <div id=copyright></div>
`;

class Copyright extends HTMLElement {
    static observedAttributes = ["name", "start-year"];
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(copyrightTemplate.content.cloneNode(true));
    }

    get name() {
        return this.getAttribute("name");
    }

    set name(val) {
        this.setAttribute("name", val);
    }

    get startYear() {
        return parseInt(this.getAttribute("start-year"));
    }

    set startYear(val) {
        this.setAttribute("start-year", val);
    }

    connectedCallback() {
        this.updateDisplay();
    }

    attributeChangedCallback(name, _oldValue, _newValue) {
        switch(name) {
            case "name":
                this.updateDisplay();
                break;
            case "start-year":
                this.updateDisplay();
                break;
            default:
                console.log(`Unknown attribute [${name}] has changed.`);
        }
    }

    updateDisplay() {
        let curYear = (new Date().getFullYear());
        let yearTxt = this.startYear === curYear ? this.startYear : `${this.startYear} - ${curYear}`;
        this.shadowRoot.getElementById("copyright").innerHTML = `${yearTxt} ${this.name}. All rights reserved.`;
    }
}

customElements.define("copyright-elem", Copyright);
