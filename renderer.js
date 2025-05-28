const webview = document.getElementById('browser-frame');
const urlBar = document.getElementById('url-bar');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');
const clearCacheBtn = document.getElementById('clear-cache-btn');

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
const webviewField = document.getElementById('browser-frame');

document.addEventListener('click', (e) => {
    if (menuBtn.contains(e.target)) {
        dropdownMenu.classList.toggle('show');
    } else if (!dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
    }
});

// Also close dropdown when clicking inside the webview
if (webviewField) {
    webviewField.addEventListener('focus', () => {
        dropdownMenu.classList.remove('show');
    });
    // For some Electron/webview implementations, 'focus' may not fire.
    // As a fallback, use 'mousedown' on the webview container:
    webviewField.addEventListener('mousedown', () => {
        dropdownMenu.classList.remove('show');
    });
}

// Settings popup logic
const settingsBtn = document.getElementById('settings-btn');
const closeBtn = document.getElementById('close-btn');

function createSettingsPopup() {
    if (document.getElementById('settings-popup')) return;
    const popup = document.createElement('div');
    popup.id = 'settings-popup';
    popup.innerHTML = `
        <div class="settings-content">
            <h2>Settings</h2>
            <label class="theme-toggle">
                <span>Theme:</span>
                <select id="theme-select">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </label>
            <button id="close-settings">Close</button>
        </div>
    `;
    document.body.appendChild(popup);
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'settings-overlay';
    document.body.appendChild(overlay);

    // Set current theme in select
    const theme = localStorage.getItem('app-theme') || 'light';
    document.getElementById('theme-select').value = theme;

    // Close logic
    document.getElementById('close-settings').onclick = closeSettingsPopup;
    overlay.onclick = closeSettingsPopup;

    // Theme change logic
    document.getElementById('theme-select').onchange = (e) => {
        setTheme(e.target.value);
    };
}

function closeSettingsPopup() {
    const popup = document.getElementById('settings-popup');
    const overlay = document.getElementById('settings-overlay');
    if (popup) popup.remove();
    if (overlay) overlay.remove();
}

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
}

// Load theme on startup
(function() {
    const theme = localStorage.getItem('app-theme') || 'light';
    setTheme(theme);
})();

settingsBtn.addEventListener('click', () => {
    createSettingsPopup();
    document.getElementById('dropdown-menu').classList.remove('show');
});

// Utility to show a temporary notification
function showNotification(message, duration = 2000) {
    let notif = document.getElementById('custom-notification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'custom-notification';
        notif.style.position = 'fixed';
        notif.style.top = '80px';
        notif.style.left = '50%';
        notif.style.transform = 'translateX(-50%)';
        notif.style.background = '#222';
        notif.style.color = '#fff';
        notif.style.padding = '10px 24px';
        notif.style.borderRadius = '6px';
        notif.style.zIndex = '9999';
        notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
        document.body.appendChild(notif);
    }
    notif.textContent = message;
    notif.style.display = 'block';
    setTimeout(() => {
        notif.style.display = 'none';
    }, duration);
}

// Clear cache logic
clearCacheBtn.addEventListener('click', async () => {
    const { session } = require('@electron/remote');
    try {
        await session.defaultSession.clearCache();
        // Only clear cookies, indexeddb, etc. Do NOT clear localStorage
        await session.defaultSession.clearStorageData({
            storages: ['cookies', 'indexdb', 'websql', 'serviceworkers', 'cachestorage', 'shadercache'],
            quotas: ['temporary', 'persistent', 'syncable']
        });
        webview.reload();
        showNotification('Cache and storage cleared!');
    } catch (err) {
        showNotification('Failed to clear cache: ' + err.message, 4000);
    }
    dropdownMenu.classList.remove('show');
});

// Close app when 'Close' button is clicked
closeBtn.addEventListener('click', () => {
    window.close(); // fallback for browser context
    try {
        const { app } = require('@electron/remote');
        app.quit();
    } catch (e) {
        try {
            const { remote } = require('electron');
            remote.app.quit();
        } catch (err) {
            // If both fail, do nothing
        }
    }
});