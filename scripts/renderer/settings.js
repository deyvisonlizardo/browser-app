// Settings popup and theme logic
import { settingsManager } from './settingsManager.js';

export function createSettingsPopup(closeSettingsPopup, setTheme) {
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
            <div class="settings-info">
                <small>Settings file: <span id="settings-path">${settingsManager.getSettingsFilePath()}</span></small>
            </div>
            <button id="close-settings">Close</button>
        </div>
    `;
    document.body.appendChild(popup);
    const overlay = document.createElement('div');
    overlay.id = 'settings-overlay';
    document.body.appendChild(overlay);
    const theme = settingsManager.getSetting('theme') || 'light';
    document.getElementById('theme-select').value = theme;
    document.getElementById('close-settings').onclick = closeSettingsPopup;
    overlay.onclick = closeSettingsPopup;
    document.getElementById('theme-select').onchange = (e) => {
        setTheme(e.target.value);
    };
}

export function closeSettingsPopup() {
    const popup = document.getElementById('settings-popup');
    const overlay = document.getElementById('settings-overlay');
    if (popup) popup.remove();
    if (overlay) overlay.remove();
}

export function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    settingsManager.setSetting('theme', theme);
}

export function loadThemeOnStartup(setTheme) {
    const theme = settingsManager.getSetting('theme') || 'light';
    setTheme(theme);
}
