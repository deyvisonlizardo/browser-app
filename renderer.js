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

// Password protection for sensitive actions
const SETTINGS_PASSWORD = '1234'; // Change this to your desired password

async function promptForPassword() {
    return new Promise((resolve) => {
        // Create overlay
        let overlay = document.getElementById('password-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'password-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.background = 'rgba(0,0,0,0.5)';
            overlay.style.zIndex = '10000';
            document.body.appendChild(overlay);
        }
        // Create prompt box
        let promptBox = document.createElement('div');
        promptBox.id = 'password-prompt';
        promptBox.className = 'theme-popup'; // Add a class for theme styling
        promptBox.style.position = 'fixed';
        promptBox.style.top = '50%';
        promptBox.style.left = '50%';
        promptBox.style.transform = 'translate(-50%, -50%)';
        promptBox.style.padding = '32px 28px 24px 28px';
        promptBox.style.borderRadius = '16px';
        promptBox.style.boxShadow = '0 8px 32px rgba(0,0,0,0.7)';
        promptBox.style.zIndex = '10001';
        promptBox.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
                <h3 style="margin:0 0 10px 0;">Enter Password</h3>
                <input id="password-input" type="password" style="padding:8px 16px;font-size:16px;border-radius:8px;border:1.5px solid #ccc;outline:none;background:inherit;color:inherit;" autofocus />
                <div style="color:red;font-size:13px;display:none;" id="password-error">Incorrect password</div>
                <div style="display:flex;gap:10px;margin-top:10px;">
                    <button id="password-ok" style="padding:6px 18px;border-radius:8px;border:none;background:#2563eb;color:#fff;font-size:15px;">OK</button>
                    <button id="password-cancel" style="padding:6px 18px;border-radius:8px;border:none;background:#aaa;color:#fff;font-size:15px;">Cancel</button>
                </div>
            </div>
        `;
        // Theme inheritance
        if (document.body.getAttribute('data-theme') === 'dark') {
            promptBox.style.background = '#23272e';
            promptBox.style.color = '#e3e3e3';
        } else {
            promptBox.style.background = '#fff';
            promptBox.style.color = '#222';
        }
        document.body.appendChild(promptBox);
        document.getElementById('password-input').focus();
        // Handlers
        function cleanup() {
            promptBox.remove();
            overlay.remove();
        }
        document.getElementById('password-ok').onclick = () => {
            const val = document.getElementById('password-input').value;
            if (val === SETTINGS_PASSWORD) {
                cleanup();
                resolve(true);
            } else {
                document.getElementById('password-error').style.display = 'block';
            }
        };
        document.getElementById('password-cancel').onclick = () => {
            cleanup();
            resolve(false);
        };
        document.getElementById('password-input').onkeydown = (e) => {
            if (e.key === 'Enter') document.getElementById('password-ok').click();
            if (e.key === 'Escape') document.getElementById('password-cancel').click();
        };
    });
}

settingsBtn.addEventListener('click', async () => {
    const ok = await promptForPassword();
    if (!ok) return;
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

closeBtn.addEventListener('click', async () => {
    const ok = await promptForPassword();
    if (!ok) return;
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