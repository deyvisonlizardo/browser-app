// Navigation and URL bar logic
import { showNotification } from './notification.js';

export function initNavigation(webview, urlBar, backBtn, forwardBtn, refreshBtn) {
    // Only set up button click handlers, not webview event listeners
    backBtn.addEventListener('click', () => {
        if (webview.canGoBack()) {
            webview.goBack();
            showNotification('Navigated back', 2000);
        }
    });
    forwardBtn.addEventListener('click', () => {
        if (webview.canGoForward()) {
            webview.goForward();
            showNotification('Navigated forward', 2000);
        }
    });
    refreshBtn.addEventListener('click', () => {
        webview.reload();
        showNotification('Page refreshed', 2000);
    });
}
