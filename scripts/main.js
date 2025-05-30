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