// Modularized imports
import { initNavigation } from './renderer/navigation.js';
import { initDropdown } from './renderer/dropdown.js';
import { createSettingsPopup, closeSettingsPopup, setTheme, loadThemeOnStartup } from './renderer/settings.js';
import { promptForPassword } from './renderer/password.js';
import { showNotification } from './renderer/notification.js';
import { initCacheClear } from './renderer/cache.js';
import { initClose } from './renderer/close.js';
import { injectNewWindowHandler, setupNewWindowHandling } from './renderer/newWindowHandler.js';

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

// Tab management system
let tabIdCounter = 1;
let tabs = [{
    id: 0,
    title: 'Loading...',
    favicon: '',
    url: webview ? webview.getAttribute('src') : 'https://www.icbeutechzone.com',
    active: true,
    webview: webview
}];

const DEFAULT_URL = 'https://www.icbeutechzone.com';
const MAX_TABS = 3;

// Tab-aware navigation functions
function updateNavButtons() {
    const activeTab = tabs.find(t => t.active);
    if (activeTab && activeTab.webview) {
        backBtn.disabled = !activeTab.webview.canGoBack();
        forwardBtn.disabled = !activeTab.webview.canGoForward();
    } else {
        backBtn.disabled = true;
        forwardBtn.disabled = true;
    }
}

function initTabAwareNavigation() {
    backBtn.addEventListener('click', () => {
        const activeTab = tabs.find(t => t.active);
        if (activeTab && activeTab.webview && activeTab.webview.canGoBack()) {
            activeTab.webview.goBack();
        }
    });
    
    forwardBtn.addEventListener('click', () => {
        const activeTab = tabs.find(t => t.active);
        if (activeTab && activeTab.webview && activeTab.webview.canGoForward()) {
            activeTab.webview.goForward();
        }
    });
    
    refreshBtn.addEventListener('click', () => {
        const activeTab = tabs.find(t => t.active);
        if (activeTab && activeTab.webview) {
            activeTab.webview.reload();
        }
    });
}

function createTabElement(tab) {
    const tabDiv = document.createElement('div');
    tabDiv.className = 'tab' + (tab.active ? ' active' : '');
    tabDiv.dataset.tabId = tab.id;
    
    // Favicon
    if (tab.favicon) {
        const icon = document.createElement('img');
        icon.src = tab.favicon;
        icon.alt = 'Favicon';
        icon.style.width = '16px';
        icon.style.height = '16px';
        icon.style.marginRight = '8px';
        icon.style.verticalAlign = 'middle';
        tabDiv.appendChild(icon);
    }
    
    // Title
    const maxTabTitleLength = 32;
    let displayTitle = tab.title || tab.url;
    if (displayTitle.length > maxTabTitleLength) {
        displayTitle = displayTitle.slice(0, maxTabTitleLength - 1) + '…';
    }
    const titleSpan = document.createElement('span');
    titleSpan.textContent = displayTitle;
    titleSpan.style.overflow = 'hidden';
    titleSpan.style.textOverflow = 'ellipsis';
    titleSpan.style.whiteSpace = 'nowrap';
    titleSpan.style.maxWidth = '160px';
    titleSpan.style.display = 'inline-block';
    tabDiv.appendChild(titleSpan);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-tab';
    closeBtn.title = 'Close tab';
    closeBtn.innerHTML = '\u2715';
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeTab(tab.id);
    };
    tabDiv.appendChild(closeBtn);
      // Click to activate
    tabDiv.onclick = () => activateTab(tab.id);
    
    // Prevent middle mouse button from opening new tabs
    tabDiv.addEventListener('auxclick', (e) => {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            e.stopPropagation();
            // Just activate the tab instead of opening a new one
            activateTab(tab.id);
        }
    });
    
    tabDiv.addEventListener('mousedown', (e) => {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            e.stopPropagation();
        }
    });
    
    return tabDiv;
}

function renderTabs() {
    const tabBar = document.getElementById('tab-bar');
    if (!tabBar) return;
    
    // Remove all tabs except the add button
    Array.from(tabBar.querySelectorAll('.tab')).forEach(t => t.remove());
    
    // Insert tabs before the add button
    const addBtn = tabBar.querySelector('#add-tab-btn');
    tabs.forEach(tab => {
        const tabElem = createTabElement(tab);
        tabBar.insertBefore(tabElem, addBtn);
    });
    
    // Show/hide add button based on max tabs limit
    if (tabs.length >= MAX_TABS) {
        addBtn.style.display = 'none';
    } else {
        addBtn.style.display = 'flex';
    }
}

function activateTab(tabId) {
    tabs.forEach(tab => tab.active = (tab.id === tabId));
    renderTabs();
    
    // Hide all webviews, show only the active one
    tabs.forEach(tab => {
        if (tab.webview) {
            tab.webview.style.display = tab.active ? '' : 'none';
        }
    });
    
    // If the webview doesn't exist yet, create it
    const tab = tabs.find(t => t.id === tabId);
    if (tab && !tab.webview) {
        createWebviewForTab(tab);
    }
    
    // Update url bar and navigation buttons for the active tab
    updateUrlBarForActiveTab();
    updateNavButtons();
}

function createWebviewForTab(tab) {
    const webviewContainer = document.getElementById('webview-container');
    const newWebview = document.createElement('webview');
    newWebview.setAttribute('src', tab.url);
    newWebview.setAttribute('id', 'browser-frame-' + tab.id);
    newWebview.style.width = '100%';
    newWebview.style.height = '100%';
    newWebview.style.display = tab.active ? '' : 'none';
    
    // Prevent middle mouse button from opening new tabs/windows
    newWebview.addEventListener('auxclick', (e) => {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            e.stopPropagation();
            console.log('🚫 Middle mouse click on webview prevented');
        }
    });
    
    newWebview.addEventListener('mousedown', (e) => {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            e.stopPropagation();
            console.log('🚫 Middle mouse down on webview prevented');
        }
    });
    
    webviewContainer.appendChild(newWebview);
    tab.webview = newWebview;
    attachWebviewEvents(tab);
}

function closeTab(tabId) {
    const idx = tabs.findIndex(t => t.id === tabId);
    if (idx === -1) return;
    
    // Remove webview if exists
    if (tabs[idx].webview) {
        tabs[idx].webview.remove();
    }
    
    tabs.splice(idx, 1);
    
    // If no tabs left, open a new one with default page
    if (tabs.length === 0) {
        addTab(DEFAULT_URL);
    } else {
        // Activate the previous tab or the first
        const newActive = tabs[Math.max(0, idx - 1)];
        activateTab(newActive.id);
    }
}

function addTab(url = null) {
    // Always use DEFAULT_URL for new tabs unless a specific URL is provided
    const defaultUrl = url || DEFAULT_URL;
    
    const newTab = {
        id: tabIdCounter++,
        title: 'Loading...',
        favicon: '',
        url: defaultUrl,
        active: true,
        webview: null
    };
    
    tabs.forEach(t => t.active = false);
    tabs.push(newTab);
    renderTabs();
    activateTab(newTab.id);
}

function attachWebviewEvents(tab) {
    if (!tab.webview) return;
    // Prevent attaching listeners multiple times
    if (tab.webview._listenersAttached) return;
    tab.webview._listenersAttached = true;

    // Setup new window handling for this tab
    setupNewWindowHandling(tab);

    tab.webview.addEventListener('did-navigate', (event) => {
        tab.url = event.url;
        updateTabInfo(tab);
        updateUrlBarForActiveTab();
        updateNavButtons();
    });
    
    tab.webview.addEventListener('did-navigate-in-page', (event) => {
        tab.url = event.url;
        updateTabInfo(tab);
        updateUrlBarForActiveTab();
        updateNavButtons();
    });
    
    tab.webview.addEventListener('page-title-updated', () => {
        updateTabInfo(tab);
    });
    
    tab.webview.addEventListener('dom-ready', () => {
        updateTabInfo(tab);
        updateUrlBarForActiveTab();
        updateNavButtons();
        
        // Inject script to handle new window/tab requests
        // This only affects the webview content, not the main application
        injectNewWindowHandler(tab.webview);
    });
}

function updateTabInfo(tab) {
    if (!tab.webview) return;
    
    Promise.all([
        tab.webview.executeJavaScript('document.title').catch(() => ''),
        tab.webview.executeJavaScript(`(() => {
            const links = document.querySelectorAll('link[rel~="icon"]');
            if (links.length) return links[0].href;
            return '';
        })()`).catch(() => '')
    ]).then(([title, favicon]) => {
        tab.title = title || tab.webview.getURL();
        tab.favicon = favicon;
        tab.url = tab.webview.getURL();
        renderTabs();
    });
}



function updateUrlBarForActiveTab() {
    const urlBar = document.getElementById('url-bar');
    const activeTab = tabs.find(t => t.active);
    if (urlBar && activeTab && activeTab.webview) {
        urlBar.textContent = activeTab.webview.getURL();
    }
}

// Initialize modules with tab-aware navigation
initTabAwareNavigation();
initDropdown(menuBtn, dropdownMenu, webviewField);

// Initialize improved cache clearing function
initCacheClear(clearCacheBtn, null, dropdownMenu);

initClose(closeBtn);

// Theme and settings
loadThemeOnStartup(setTheme);
settingsBtn.addEventListener('click', async () => {
    const ok = await promptForPassword();
    if (!ok) return;
    createSettingsPopup(closeSettingsPopup, setTheme);
    dropdownMenu.classList.remove('show');
});

// Add tab button functionality
document.getElementById('add-tab-btn').onclick = () => addTab();

// Global prevention of middle mouse button new tab behavior
document.addEventListener('auxclick', (e) => {
    if (e.button === 1) { // Middle mouse button
        e.preventDefault();
        e.stopPropagation();
        console.log('🚫 Global middle mouse button click intercepted and prevented');
    }
}, true);

document.addEventListener('mousedown', (e) => {
    if (e.button === 1) { // Middle mouse button
        e.preventDefault();
        e.stopPropagation();
        console.log('🚫 Global middle mouse button down intercepted and prevented');
    }
}, true);

// Initial setup for the first tab
if (webview) {
    // Add middle mouse button prevention to the initial webview
    webview.addEventListener('auxclick', (e) => {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            e.stopPropagation();
            console.log('🚫 Middle mouse click on initial webview prevented');
        }
    });
    
    webview.addEventListener('mousedown', (e) => {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            e.stopPropagation();
            console.log('🚫 Middle mouse down on initial webview prevented');
        }
    });
    
    attachWebviewEvents(tabs[0]);
    updateTabInfo(tabs[0]);
}
renderTabs();
updateNavButtons();

// Safeguard: Ensure main application window.open is not affected
// This protects the main app's popups (settings, notifications, etc.)
if (window.location.protocol === 'file:' && window.location.pathname.includes('index.html')) {
    console.log('🛡️ Main application window protected from new window handler');
    // Ensure we don't interfere with main app popups
}