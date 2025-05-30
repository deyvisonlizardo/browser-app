// App close logic
import { promptForPassword } from './password.js';
export function initClose(closeBtn) {
    closeBtn.addEventListener('click', async () => {
        const ok = await promptForPassword();
        if (!ok) return;
        window.close();
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
}
