// Modularized imports
import { initNavigation } from './renderer/navigation.js';
import { initDropdown } from './renderer/dropdown.js';
import { createSettingsPopup, closeSettingsPopup, setTheme, loadThemeOnStartup } from './renderer/settings.js';
import { promptForPassword } from './renderer/password.js';
import { showNotification } from './renderer/notification.js';
import { initCacheClear } from './renderer/cache.js';
import { initClose } from './renderer/close.js';

// DOM elements
const webview = document.getElementById('browser-frame');
const urlBar = document.getElementById('url-bar');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');
const clearCacheBtn = document.getElementById('clear-cache-btn');
const menuBtn = document.getElementById('menu-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
const webviewField = document.getElementById('browser-frame');
const settingsBtn = document.getElementById('settings-btn');
const closeBtn = document.getElementById('close-btn');
const tabBar = document.getElementById('tab-bar');

// Initialize modules
initNavigation(webview, urlBar, backBtn, forwardBtn, refreshBtn);
initDropdown(menuBtn, dropdownMenu, webviewField);
initCacheClear(clearCacheBtn, webview, dropdownMenu);
initClose(closeBtn);

// Theme and settings
loadThemeOnStartup(setTheme);
settingsBtn.addEventListener('click', async () => {
    const ok = await promptForPassword();
    if (!ok) return;
    createSettingsPopup(closeSettingsPopup, setTheme);
    dropdownMenu.classList.remove('show');
});

// Recognize and update the active tab based on the current page being viewed, including favicon
function updateActiveTabWithCurrentPage() {
    const webview = document.getElementById('browser-frame');
    const tabBar = document.getElementById('tab-bar');
    if (!webview || !tabBar) return;
    const tab = tabBar.querySelector('.tab');
    if (!tab) return;
    // Try to get the page title and favicon
    Promise.all([
        webview.executeJavaScript('document.title'),
        webview.executeJavaScript(`(() => {
            const links = document.querySelectorAll('link[rel~="icon"]');
            if (links.length) return links[0].href;
            return '';
        })()`)
    ]).then(([title, favicon]) => {
        tab.textContent = '';
        // Add favicon if available
        if (favicon) {
            const icon = document.createElement('img');
            icon.src = favicon;
            icon.alt = 'Favicon';
            icon.style.width = '16px';
            icon.style.height = '16px';
            icon.style.marginRight = '8px';
            icon.style.verticalAlign = 'middle';
            tab.appendChild(icon);
        }
        tab.appendChild(document.createTextNode(title || webview.getURL()));
        // Re-add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-tab';
        closeBtn.title = 'Close tab';
        closeBtn.innerHTML = '\u2715';
        tab.appendChild(closeBtn);
    }).catch(() => {
        tab.textContent = webview.getURL();
    });
}

// Listen for navigation events to update the tab
if (webview) {
    webview.addEventListener('did-navigate', updateActiveTabWithCurrentPage);
    webview.addEventListener('did-navigate-in-page', updateActiveTabWithCurrentPage);
    webview.addEventListener('page-title-updated', updateActiveTabWithCurrentPage);
}