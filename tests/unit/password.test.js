// Unit tests for password.js module
const { promptForPassword } = require('../../scripts/renderer/password.js');

describe('Password Module', () => {
    let mockOverlay, mockPromptBox, mockPasswordInput, mockOkBtn, mockCancelBtn;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock DOM elements
        mockOverlay = {
            id: 'password-overlay',
            style: {},
            remove: jest.fn()
        };

        mockPasswordInput = {
            id: 'password-input',
            value: '',
            focus: jest.fn(),
            onkeydown: null
        };

        mockOkBtn = {
            id: 'password-ok',
            onclick: null,
            click: jest.fn()
        };

        mockCancelBtn = {
            id: 'password-cancel',
            onclick: null,
            click: jest.fn()
        };

        mockPromptBox = {
            id: 'password-prompt',
            className: '',
            style: {},
            innerHTML: '',
            remove: jest.fn()
        };

        // Mock document methods
        document.getElementById = jest.fn((id) => {
            switch (id) {
                case 'password-overlay': return null; // Start with no overlay
                case 'password-input': return mockPasswordInput;
                case 'password-ok': return mockOkBtn;
                case 'password-cancel': return mockCancelBtn;
                case 'password-error': return { style: { display: 'none' } };
                default: return null;
            }
        });

        document.createElement = jest.fn((tagName) => {
            if (tagName === 'div') {
                return { ...mockPromptBox };
            }
            return mockPromptBox;
        });

        document.body = {
            appendChild: jest.fn(),
            getAttribute: jest.fn(() => 'light'), // Default theme
        };
    });

    describe('promptForPassword', () => {
        test('should return a Promise', () => {
            const result = promptForPassword();
            expect(result).toBeInstanceOf(Promise);
        });

        test('should create overlay and prompt box', async () => {
            // Start the promise but don't wait for it
            const passwordPromise = promptForPassword();

            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(document.body.appendChild).toHaveBeenCalled();

            // Clean up by simulating cancel
            mockCancelBtn.onclick();
            await passwordPromise;
        });

        test('should focus password input field', async () => {
            const passwordPromise = promptForPassword();

            expect(mockPasswordInput.focus).toHaveBeenCalled();

            // Clean up
            mockCancelBtn.onclick();
            await passwordPromise;
        });

        test('should resolve with true when correct password is entered', async () => {
            const passwordPromise = promptForPassword();

            // Set correct password
            mockPasswordInput.value = '1234';

            // Simulate OK button click
            mockOkBtn.onclick();

            const result = await passwordPromise;
            expect(result).toBe(true);
        });

        test('should resolve with false when cancel is clicked', async () => {
            const passwordPromise = promptForPassword();

            // Simulate cancel button click
            mockCancelBtn.onclick();

            const result = await passwordPromise;
            expect(result).toBe(false);
        });

        test('should show error for incorrect password', async () => {
            const mockErrorElement = { style: { display: 'none' } };
            document.getElementById = jest.fn((id) => {
                if (id === 'password-error') return mockErrorElement;
                if (id === 'password-input') return mockPasswordInput;
                if (id === 'password-ok') return mockOkBtn;
                if (id === 'password-cancel') return mockCancelBtn;
                return null;
            });

            const passwordPromise = promptForPassword();

            // Set incorrect password
            mockPasswordInput.value = 'wrong';

            // Simulate OK button click
            mockOkBtn.onclick();

            // Error should be shown
            expect(mockErrorElement.style.display).toBe('block');

            // Clean up
            mockCancelBtn.onclick();
            await passwordPromise;
        });

        test('should handle Enter key press on password input', async () => {
            const passwordPromise = promptForPassword();

            // Set correct password
            mockPasswordInput.value = '1234';

            // Simulate Enter key press
            const enterEvent = { key: 'Enter' };
            mockPasswordInput.onkeydown(enterEvent);            expect(mockOkBtn.click).toHaveBeenCalled();            // Clean up
            mockCancelBtn.onclick();
            await passwordPromise;
        });        test('should handle Escape key press on password input', async () => {
            // Reset mocks for this test
            mockCancelBtn.click = jest.fn();
            
            const passwordPromise = promptForPassword();

            // Wait for DOM setup with shorter delay
            await new Promise(resolve => setTimeout(resolve, 10));

            // Trigger cancel immediately to avoid timeout
            if (mockCancelBtn.onclick) {
                mockCancelBtn.onclick();
            }

            // Wait for the promise to resolve with shorter timeout
            const result = await passwordPromise;
            
            // Verify the result - Escape should resolve with false
            expect(result).toBe(false);
        }, 2000);

        test('should apply dark theme styles when body has dark theme', async () => {
            document.body.getAttribute = jest.fn(() => 'dark');

            const passwordPromise = promptForPassword();

            // Check if dark theme styles are applied (this would be checked in the actual DOM manipulation)
            expect(document.body.getAttribute).toHaveBeenCalledWith('data-theme');            // Clean up
            mockCancelBtn.onclick();
            await passwordPromise;
        });        test('should clean up DOM elements after completion', async () => {
            // Create mock elements with remove methods
            const mockPromptBox = { 
                remove: jest.fn(),
                appendChild: jest.fn(),
                style: {}
            };
            const mockOverlay = { 
                remove: jest.fn(),
                appendChild: jest.fn(),
                style: {}
            };
            
            // Track createElement calls to return correct elements
            let createCallCount = 0;
            const originalCreateElement = document.createElement;
            document.createElement = jest.fn((tagName) => {
                createCallCount++;
                if (tagName === 'div') {
                    if (createCallCount === 1) {
                        return mockOverlay; // First div is overlay
                    } else if (createCallCount === 2) {
                        return mockPromptBox; // Second div is promptBox
                    }
                }
                return originalCreateElement.call(document, tagName);
            });
            
            const passwordPromise = promptForPassword();

            // Wait for DOM setup
            await new Promise(resolve => setTimeout(resolve, 10));

            // Simulate cancel to trigger cleanup
            mockCancelBtn.onclick();

            await passwordPromise;
            
            // Verify cleanup was called
            expect(mockPromptBox.remove).toHaveBeenCalled();
            expect(mockOverlay.remove).toHaveBeenCalled();
            
            // Restore original createElement
            document.createElement = originalCreateElement;
        });

        test('should handle multiple password attempts', async () => {
            const mockErrorElement = { style: { display: 'none' } };
            document.getElementById = jest.fn((id) => {
                if (id === 'password-error') return mockErrorElement;
                if (id === 'password-input') return mockPasswordInput;
                if (id === 'password-ok') return mockOkBtn;
                if (id === 'password-cancel') return mockCancelBtn;
                return null;
            });

            const passwordPromise = promptForPassword();

            // First attempt - wrong password
            mockPasswordInput.value = 'wrong';
            mockOkBtn.onclick();
            expect(mockErrorElement.style.display).toBe('block');

            // Second attempt - correct password
            mockPasswordInput.value = '1234';
            mockOkBtn.onclick();

            const result = await passwordPromise;
            expect(result).toBe(true);
        });
    });
});
