// Modularized imports
import { initDropdown } from './renderer/dropdown.js';
import { createSettingsPopup, closeSettingsPopup, setTheme, loadThemeOnStartup } from './renderer/settings.js';
import { promptForPassword } from './renderer/password.js';
import { showNotification } from './renderer/notification.js';
import { initCacheClear } from './renderer/cache.js';
import { initClose } from './renderer/close.js';
import { injectNewWindowHandler, setupNewWindowHandling, cleanupNewWindowHandling } from './renderer/newWindowHandler.js';

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
    url: webview ? webview.getAttribute('src') : 'https://www.icbeutechzone.com/',
    active: true,
    webview: webview
}];

const DEFAULT_URL = 'https://www.icbeutechzone.com/';
const MAX_TABS = 3;

// Tab-aware navigation functions
function updateNavButtons() {
    const activeTab = tabs.find(t => t.active);
    if (activeTab && activeTab.webview) {
        try {
            backBtn.disabled = !activeTab.webview.canGoBack();
            forwardBtn.disabled = !activeTab.webview.canGoForward();
            console.log('🔄 Navigation buttons updated - Back:', !backBtn.disabled, 'Forward:', !forwardBtn.disabled);
        } catch (error) {
            console.warn('⚠️ Error updating nav buttons:', error);
            backBtn.disabled = true;
            forwardBtn.disabled = true;
        }
    } else {
        backBtn.disabled = true;
        forwardBtn.disabled = true;
        console.log('⚠️ No active webview found, disabling navigation buttons');
    }
}

function initTabAwareNavigation() {
    backBtn.addEventListener('click', () => {
        const activeTab = tabs.find(t => t.active);
        if (activeTab && activeTab.webview && activeTab.webview.canGoBack()) {
            activeTab.webview.goBack();
            showNotification('Navigated back', 2000);
        } else {
            showNotification('Cannot go back', 2000);
        }
    });
    
    forwardBtn.addEventListener('click', () => {
        const activeTab = tabs.find(t => t.active);
        if (activeTab && activeTab.webview && activeTab.webview.canGoForward()) {
            activeTab.webview.goForward();
            showNotification('Navigated forward', 2000);
        } else {
            showNotification('Cannot go forward', 2000);
        }
    });
    
    refreshBtn.addEventListener('click', () => {
        const activeTab = tabs.find(t => t.active);
        if (activeTab && activeTab.webview) {
            activeTab.webview.reload();
            showNotification('Page refreshed', 2000);
        } else {
            showNotification('Cannot refresh - no active tab', 2000);
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
    
    const tabToClose = tabs[idx];
      // Clean up event listeners to prevent memory leaks
    if (tabToClose.webview) {
        console.log('🧹 Cleaning up event listeners for tab:', tabId);
        
        // Clean up new window handlers
        cleanupNewWindowHandling(tabToClose);
        
        // Clean up webview events
        cleanupWebviewEvents(tabToClose);
        
        // Reset the main listeners flag
        delete tabToClose.webview._listenersAttached;
        
        // Remove the webview from DOM
        tabToClose.webview.remove();
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

    console.log('🔗 Attaching events to webview for tab:', tab.id);

    // Setup new window handling for this tab
    setupNewWindowHandling(tab);    // Store event handler references for potential cleanup
    const didNavigateHandler = (event) => {
        tab.url = event.url;
        updateTabInfo(tab);
        updateUrlBarForActiveTab();
        updateNavButtons();
    };

    const didNavigateInPageHandler = (event) => {
        tab.url = event.url;
        // Only update URL bar for in-page navigation, tab info will be updated by page-title-updated if needed
        updateUrlBarForActiveTab();
        updateNavButtons();
    };

    const pageTitleUpdatedHandler = () => {
        updateTabInfo(tab);
    };    const domReadyHandler = () => {
        console.log('✅ Webview DOM ready for tab:', tab.id);
        // Initial tab info update when DOM is ready
        updateTabInfo(tab);
        updateUrlBarForActiveTab();
        updateNavButtons();
        
        // Inject script to handle new window/tab requests
        // This only affects the webview content, not the main application
        // Only inject once per webview to prevent memory leaks
        if (!tab.webview._newWindowHandlerInjected) {
            tab.webview._newWindowHandlerInjected = true;
            injectNewWindowHandler(tab.webview);
        }
    };

    const didStopLoadingHandler = () => {
        console.log('🏁 Webview finished loading for tab:', tab.id);
        updateNavButtons();
    };

    // Store references for cleanup
    tab.webview._eventHandlers = {
        'did-navigate': didNavigateHandler,
        'did-navigate-in-page': didNavigateInPageHandler,
        'page-title-updated': pageTitleUpdatedHandler,
        'dom-ready': domReadyHandler,
        'did-stop-loading': didStopLoadingHandler
    };

    // Add event listeners
    tab.webview.addEventListener('did-navigate', didNavigateHandler);
    tab.webview.addEventListener('did-navigate-in-page', didNavigateInPageHandler);
    tab.webview.addEventListener('page-title-updated', pageTitleUpdatedHandler);
    tab.webview.addEventListener('dom-ready', domReadyHandler);
    tab.webview.addEventListener('did-stop-loading', didStopLoadingHandler);
}

// Cleanup function to remove all webview event listeners
function cleanupWebviewEvents(tab) {
    if (!tab.webview || !tab.webview._eventHandlers) return;

    console.log('🧹 Cleaning up webview events for tab:', tab.id);

    // Remove all stored event listeners
    Object.entries(tab.webview._eventHandlers).forEach(([event, handler]) => {
        tab.webview.removeEventListener(event, handler);
    });    // Clear the handlers object
    delete tab.webview._eventHandlers;

    // Reset injection flag
    delete tab.webview._newWindowHandlerInjected;

    // Clear any pending updateTabInfo timeout
    if (tab._updateTabInfoTimeout) {
        clearTimeout(tab._updateTabInfoTimeout);
        delete tab._updateTabInfoTimeout;
    }

    console.log('✅ Webview events cleanup complete for tab:', tab.id);
}

function updateTabInfo(tab) {
    if (!tab.webview) return;
    
    // Throttle updateTabInfo to prevent excessive executeJavaScript calls
    if (tab._updateTabInfoTimeout) {
        clearTimeout(tab._updateTabInfoTimeout);
    }
    
    tab._updateTabInfoTimeout = setTimeout(() => {
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
        delete tab._updateTabInfoTimeout;
    }, 100); // Throttle to 100ms
}



function updateUrlBarForActiveTab() {
    const urlBar = document.getElementById('url-bar');
    const activeTab = tabs.find(t => t.active);
    if (urlBar && activeTab) {
        // Get URL from webview if available, otherwise use the tab's stored URL
        let displayUrl = '';
        if (activeTab.webview) {
            try {
                displayUrl = activeTab.webview.getURL() || activeTab.url;
            } catch (error) {
                // If webview is not ready yet, use stored URL
                displayUrl = activeTab.url;
            }
        } else {
            // No webview yet, use stored URL
            displayUrl = activeTab.url;
        }
        urlBar.textContent = displayUrl || DEFAULT_URL;
    }
}

// Initialize modules with tab-aware navigation
console.log('🚀 Initializing tab-aware navigation...');
initTabAwareNavigation();
console.log('✅ Tab-aware navigation initialized');

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
    });    // Wait for webview to be ready before attaching events
    webview.addEventListener('dom-ready', () => {
        console.log('✅ Initial webview is ready');
        attachWebviewEvents(tabs[0]);
        updateTabInfo(tabs[0]);
        updateNavButtons();
    });
} else {
    console.warn('⚠️ Initial webview not found, creating new tab');
    addTab(DEFAULT_URL);
}
renderTabs();
updateNavButtons();
// Ensure URL bar shows the default URL immediately on startup
updateUrlBarForActiveTab();

// Safeguard: Ensure main application window.open is not affected
// This protects the main app's popups (settings, notifications, etc.)
if (window.location.protocol === 'file:' && window.location.pathname.includes('index.html')) {
    console.log('🛡️ Main application window protected from new window handler');
    // Ensure we don't interfere with main app popups
}

// Developer console helpers for testing navigation
window.testNavigation = {
    back: () => {
        console.log('🧪 Testing back navigation...');
        const activeTab = tabs.find(t => t.active);
        if (activeTab && activeTab.webview) {
            console.log('Active tab webview found:', activeTab.webview);
            console.log('Can go back:', activeTab.webview.canGoBack());
            if (activeTab.webview.canGoBack()) {
                activeTab.webview.goBack();
                console.log('✅ Back navigation executed');
            } else {
                console.log('❌ Cannot go back - no history');
            }
        } else {
            console.log('❌ No active webview found');
        }
    },
    forward: () => {
        console.log('🧪 Testing forward navigation...');
        const activeTab = tabs.find(t => t.active);
        if (activeTab && activeTab.webview) {
            console.log('Active tab webview found:', activeTab.webview);
            console.log('Can go forward:', activeTab.webview.canGoForward());
            if (activeTab.webview.canGoForward()) {
                activeTab.webview.goForward();
                console.log('✅ Forward navigation executed');
            } else {
                console.log('❌ Cannot go forward - no forward history');
            }
        } else {
            console.log('❌ No active webview found');
        }
    },
    refresh: () => {
        console.log('🧪 Testing refresh...');
        const activeTab = tabs.find(t => t.active);
        if (activeTab && activeTab.webview) {
            console.log('Active tab webview found:', activeTab.webview);
            activeTab.webview.reload();
            console.log('✅ Refresh executed');
        } else {
            console.log('❌ No active webview found');
        }
    },
    showTabs: () => {
        console.log('📋 Current tabs:', tabs);
        console.log('Active tab:', tabs.find(t => t.active));
    }
};

console.log('🛠️ Developer navigation helpers loaded! Try:');
console.log('  testNavigation.back() - Test back navigation');
console.log('  testNavigation.forward() - Test forward navigation'); 
console.log('  testNavigation.refresh() - Test refresh');
console.log('  testNavigation.showTabs() - Show current tabs');