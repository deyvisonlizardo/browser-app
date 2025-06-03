// Navigation and URL bar logic
export function initNavigation(webview, urlBar, backBtn, forwardBtn, refreshBtn) {
    // Only set up button click handlers, not webview event listeners
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
