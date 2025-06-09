// Unit tests for settings.js module

// Mock settingsManager before importing
jest.mock('../../scripts/renderer/settingsManager.js', () => ({
    settingsManager: {
        getSetting: jest.fn(),
        setSetting: jest.fn(),
        getSettingsFilePath: jest.fn(() => '/mock/settings.json')
    }
}));

const { createSettingsPopup, closeSettingsPopup, setTheme, loadThemeOnStartup } = require('../../scripts/renderer/settings.js');
const { settingsManager } = require('../../scripts/renderer/settingsManager.js');

describe('Settings Module', () => {
    let mockCloseFunction, mockSetThemeFunction;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockCloseFunction = jest.fn();
        mockSetThemeFunction = jest.fn();

        // Mock DOM methods
        document.getElementById = jest.fn((id) => {
            if (id === 'settings-popup') return null; // Start with no popup
            if (id === 'theme-select') return { value: 'light', onchange: null };
            if (id === 'close-settings') return { onclick: null };
            if (id === 'settings-path') return { textContent: '' };
            return null;
        });

        document.createElement = jest.fn((tagName) => {
            const mockElement = {
                id: '',
                innerHTML: '',
                onclick: null,
                onchange: null,
                value: '',
                style: {},
                textContent: ''
            };
            return mockElement;
        });

        document.body = {
            appendChild: jest.fn(),
            setAttribute: jest.fn(),
            getAttribute: jest.fn()
        };

        // Mock settingsManager methods
        settingsManager.getSetting.mockReturnValue('light');
        settingsManager.getSettingsFilePath.mockReturnValue('/mock/settings.json');
    });

    describe('createSettingsPopup', () => {
        test('should create settings popup when none exists', () => {
            createSettingsPopup(mockCloseFunction, mockSetThemeFunction);

            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalledTimes(2); // popup + overlay
        });

        test('should not create popup if one already exists', () => {
            // Mock existing popup
            document.getElementById = jest.fn((id) => {
                if (id === 'settings-popup') return { id: 'settings-popup' };
                return null;
            });

            createSettingsPopup(mockCloseFunction, mockSetThemeFunction);

            expect(document.createElement).not.toHaveBeenCalled();
        });

        test('should load current theme from settings', () => {
            settingsManager.getSetting.mockReturnValue('dark');

            createSettingsPopup(mockCloseFunction, mockSetThemeFunction);

            expect(settingsManager.getSetting).toHaveBeenCalledWith('theme');
        });

        test('should set up close button handler', () => {
            const mockCloseBtn = { onclick: null };
            document.getElementById = jest.fn((id) => {
                if (id === 'settings-popup') return null;
                if (id === 'close-settings') return mockCloseBtn;
                return { value: 'light', onchange: null };
            });

            createSettingsPopup(mockCloseFunction, mockSetThemeFunction);

            expect(mockCloseBtn.onclick).toBe(mockCloseFunction);
        });

        test('should set up theme selector handler', () => {
            const mockThemeSelect = { value: 'light', onchange: null };
            document.getElementById = jest.fn((id) => {
                if (id === 'settings-popup') return null;
                if (id === 'theme-select') return mockThemeSelect;
                return { onclick: null };
            });

            createSettingsPopup(mockCloseFunction, mockSetThemeFunction);

            expect(mockThemeSelect.onchange).toEqual(expect.any(Function));
        });
    });

    describe('closeSettingsPopup', () => {
        test('should remove popup and overlay elements', () => {
            const mockPopup = { remove: jest.fn() };
            const mockOverlay = { remove: jest.fn() };

            document.getElementById = jest.fn((id) => {
                if (id === 'settings-popup') return mockPopup;
                if (id === 'settings-overlay') return mockOverlay;
                return null;
            });

            closeSettingsPopup();

            expect(mockPopup.remove).toHaveBeenCalled();
            expect(mockOverlay.remove).toHaveBeenCalled();
        });

        test('should handle missing elements gracefully', () => {
            document.getElementById = jest.fn(() => null);

            expect(() => closeSettingsPopup()).not.toThrow();
        });
    });

    describe('setTheme', () => {
        test('should set theme attribute on body and save to settings', () => {
            setTheme('dark');

            expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
            expect(settingsManager.setSetting).toHaveBeenCalledWith('theme', 'dark');
        });

        test('should handle light theme', () => {
            setTheme('light');

            expect(document.body.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
            expect(settingsManager.setSetting).toHaveBeenCalledWith('theme', 'light');
        });
    });

    describe('loadThemeOnStartup', () => {
        test('should load saved theme on startup', () => {
            settingsManager.getSetting.mockReturnValue('dark');

            loadThemeOnStartup(mockSetThemeFunction);

            expect(settingsManager.getSetting).toHaveBeenCalledWith('theme');
            expect(mockSetThemeFunction).toHaveBeenCalledWith('dark');
        });

        test('should default to light theme if no saved theme', () => {
            settingsManager.getSetting.mockReturnValue(null);

            loadThemeOnStartup(mockSetThemeFunction);

            expect(mockSetThemeFunction).toHaveBeenCalledWith('light');
        });
    });
});
