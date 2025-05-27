const webview = document.getElementById('browser-frame');
const urlBar = document.getElementById('url-bar');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');

function updateNavButtons() {
    backBtn.disabled = !webview.canGoBack();
    forwardBtn.disabled = !webview.canGoForward();
}

// Update URL bar and nav buttons on navigation
webview.addEventListener('did-navigate', (event) => {
    urlBar.textContent = event.url;
    updateNavButtons();
});

webview.addEventListener('did-navigate-in-page', (event) => {
    urlBar.textContent = event.url;
    updateNavButtons();
});

// Set initial URL and nav buttons when webview is loaded
webview.addEventListener('dom-ready', () => {
    urlBar.textContent = webview.getURL();
    updateNavButtons();
});

backBtn.addEventListener('click', () => {
    if (webview.canGoBack()) webview.goBack();
});

forwardBtn.addEventListener('click', () => {
    if (webview.canGoForward()) webview.goForward();
});

refreshBtn.addEventListener('click', () => {
    webview.reload();
});

// Dropdown menu logic
const menuBtn = document.getElementById('menu-btn');
const dropdownMenu = document.getElementById('dropdown-menu');

document.addEventListener('click', (e) => {
    if (menuBtn.contains(e.target)) {
        dropdownMenu.classList.toggle('show');
    } else if (!dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
    }
});