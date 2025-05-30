// Navigation and URL bar logic
export function initNavigation(webview, urlBar, backBtn, forwardBtn, refreshBtn) {
    function updateNavButtons() {
        backBtn.disabled = !webview.canGoBack();
        forwardBtn.disabled = !webview.canGoForward();
    }
    webview.addEventListener('did-navigate', (event) => {
        urlBar.textContent = event.url;
        updateNavButtons();
    });
    webview.addEventListener('did-navigate-in-page', (event) => {
        urlBar.textContent = event.url;
        updateNavButtons();
    });
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
}
