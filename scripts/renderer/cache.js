// Comprehensive browser data clearing logic
import { showNotification } from './notification.js';

export function initCacheClear(clearCacheBtn, webview, dropdownMenu) {
    clearCacheBtn.addEventListener('click', async () => {
        const { session } = require('@electron/remote');
        
        try {
            showNotification('Clearing all browser data...', 1000);
            
            const defaultSession = session.defaultSession;
            
            // Clear cache first
            await defaultSession.clearCache();
            console.log('✅ Cache cleared');
            
            // Clear all storage data comprehensively
            await defaultSession.clearStorageData({
                storages: [
                    'cookies',           // HTTP cookies
                    'localstorage',      // Local storage
                    'sessionstorage',    // Session storage
                    'indexdb',           // IndexedDB databases
                    'websql',            // WebSQL databases (deprecated but still cleared)
                    'serviceworkers',    // Service worker registrations
                    'cachestorage',      // Cache API storage
                    'shadercache',       // GPU shader cache
                    'filesystem',        // File system API data
                    'appcache'          // Application cache (deprecated but still cleared)
                ],
                quotas: [
                    'temporary',         // Temporary storage quota
                    'persistent',        // Persistent storage quota
                    'syncable'          // Syncable storage quota
                ]
            });
            console.log('✅ All storage data cleared');
              // Clear HTTP cache and code caches
            try {
                await defaultSession.clearCodeCaches({});
                console.log('✅ Code caches cleared');
            } catch (codeCacheErr) {
                console.log('ℹ️ Code cache clearing not supported on this version:', codeCacheErr.message);
            }
              // Clear authentication credentials
            try {
                await defaultSession.clearAuthCache();
                console.log('✅ Authentication cache cleared');
            } catch (authErr) {
                console.log('ℹ️ Authentication cache clearing not supported on this version:', authErr.message);
            }
            
            // Clear download history
            try {
                await defaultSession.clearStorageData({
                    storages: ['downloads']
                });
                console.log('✅ Download history cleared');
            } catch (downloadErr) {
                console.log('ℹ️ Download history clearing not supported on this version');
            }
            
            // Clear host resolver cache
            try {
                await defaultSession.clearHostResolverCache();
                console.log('✅ Host resolver cache cleared');
            } catch (hostErr) {
                console.log('ℹ️ Host resolver cache clearing not supported on this version');
            }
            
            // Clear network predictor data
            try {
                await defaultSession.clearStorageData({
                    storages: ['neterror_predictor']
                });
                console.log('✅ Network predictor data cleared');
            } catch (netErr) {
                console.log('ℹ️ Network predictor clearing not available');
            }
            
            // Reload the active webview
            if (webview && typeof webview.reload === 'function') {
                webview.reload();
            } else {
                // Handle tab-aware reloading for multiple webviews
                const activeTab = document.querySelector('.tab.active');
                if (activeTab) {
                    const webviewId = 'browser-frame-' + activeTab.dataset.tabId;
                    const activeWebview = document.getElementById(webviewId) || document.getElementById('browser-frame');
                    if (activeWebview && typeof activeWebview.reload === 'function') {
                        activeWebview.reload();
                    }
                }
            }
            
            showNotification('All browser data cleared successfully!', 3000);
            console.log('🎉 Complete browser data clearing finished successfully');
            
        } catch (err) {
            console.error('❌ Error clearing browser data:', err);
            showNotification('Failed to clear browser data: ' + err.message, 4000);
        }
        
        // Close the dropdown menu
        dropdownMenu.classList.remove('show');
    });
}
