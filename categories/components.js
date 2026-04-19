class Lightbox extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div class="lightbox" role="dialog" aria-modal="true">
                <button class="lightbox_close" aria-label="Close">x</button>
                <img class="lightbox_img" src="" alt="">
                <div class="lightbox_meta"></div>
            </div>
        `;
    }
}
customElements.define("img-lightbox", Lightbox);

function renderNav(title) {
    const nav = document.querySelector('.nav');
    nav.innerHTML = `
        <span class="nav-title">${title}</span>
        <div class="nav-links">
            <a href="../categories/infrastructure.html">Infrastructure</a>
            <a href="../categories/nature.html">Nature</a>
            <a href="../categories/seasonal.html">Seasonal</a>
            <a href="../categories/sky.html">Sky</a>
            <a href="../categories/misc.html">Misc</a>
            <a href="../index.html">Home</a>
        </div>
    `;
}