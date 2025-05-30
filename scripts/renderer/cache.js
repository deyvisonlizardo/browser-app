// Cache clearing logic
import { showNotification } from './notification.js';
export function initCacheClear(clearCacheBtn, webview, dropdownMenu) {
    clearCacheBtn.addEventListener('click', async () => {
        const { session } = require('@electron/remote');
        try {
            await session.defaultSession.clearCache();
            await session.defaultSession.clearStorageData({
                storages: ['cookies', 'indexdb', 'websql', 'serviceworkers', 'cachestorage', 'shadercache'],
                quotas: ['temporary', 'persistent', 'syncable']
            });
            webview.reload();
            showNotification('Cache cleared!');
        } catch (err) {
            showNotification('Failed to clear cache: ' + err.message, 4000);
        }
        dropdownMenu.classList.remove('show');
    });
}
