// Settings Manager - handles JSON file operations
const fs = require('fs');
const path = require('path');

// Get user data directory and settings file path
let userDataPath;
let settingsFilePath;

try {
    const { app } = require('@electron/remote');
    userDataPath = app.getPath('userData');
} catch (error) {
    // Fallback for development or if remote is not available
    const os = require('os');
    userDataPath = path.join(os.homedir(), '.browser-app');
}

settingsFilePath = path.join(userDataPath, 'settings.json');

// Default settings
const defaultSettings = {
    theme: 'dark',
    // Add more settings here as needed
    version: '1.0.0'
};

class SettingsManager {
    constructor() {
        this.settings = null;
        this.ensureSettingsFile();
    }

    // Ensure settings file exists and load it
    ensureSettingsFile() {
        try {
            // Ensure the directory exists
            const dir = path.dirname(settingsFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log('Created settings directory at:', dir);
            }

            if (!fs.existsSync(settingsFilePath)) {
                // Create settings file with defaults if it doesn't exist
                this.saveSettings(defaultSettings);
                console.log('Created new settings file at:', settingsFilePath);
            }
            this.loadSettings();
        } catch (error) {
            console.error('Error initializing settings file:', error);
            this.settings = { ...defaultSettings };
        }
    }

    // Load settings from JSON file
    loadSettings() {
        try {
            const data = fs.readFileSync(settingsFilePath, 'utf8');
            this.settings = JSON.parse(data);
            
            // Merge with defaults to ensure all required properties exist
            this.settings = { ...defaultSettings, ...this.settings };
            
            console.log('Settings loaded from:', settingsFilePath);
            console.log('Current settings:', this.settings);
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = { ...defaultSettings };
        }
    }

    // Save settings to JSON file
    saveSettings(newSettings = null) {
        try {
            if (newSettings) {
                this.settings = { ...this.settings, ...newSettings };
            }
            
            const settingsJson = JSON.stringify(this.settings, null, 2);
            fs.writeFileSync(settingsFilePath, settingsJson, 'utf8');
            console.log('Settings saved to:', settingsFilePath);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    // Get a specific setting
    getSetting(key) {
        return this.settings ? this.settings[key] : defaultSettings[key];
    }

    // Set a specific setting and save
    setSetting(key, value) {
        if (!this.settings) {
            this.settings = { ...defaultSettings };
        }
        this.settings[key] = value;
        this.saveSettings();
    }

    // Get all settings
    getAllSettings() {
        return this.settings || { ...defaultSettings };
    }

    // Get settings file path for debugging
    getSettingsFilePath() {
        return settingsFilePath;
    }
}

// Create and export a singleton instance
const settingsManager = new SettingsManager();

// Export for both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SettingsManager, settingsManager };
}

export { SettingsManager, settingsManager };
