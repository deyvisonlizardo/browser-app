// Unit tests for close.js module

// Mock the password module before importing
jest.mock('../../scripts/renderer/password.js', () => ({
    promptForPassword: jest.fn()
}));

const { initClose } = require('../../scripts/renderer/close.js');
const { promptForPassword } = require('../../scripts/renderer/password.js');

describe('Close Module', () => {
    let mockCloseBtn, mockApp, mockRemote;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock close button
        mockCloseBtn = {
            addEventListener: jest.fn()
        };

        // Mock Electron app
        mockApp = {
            quit: jest.fn()
        };

        // Mock window.close
        global.window = {
            ...global.window,
            close: jest.fn()
        };

        // Mock require for @electron/remote
        jest.doMock('@electron/remote', () => ({
            app: mockApp
        }));

        // Mock require for electron remote (fallback)
        mockRemote = {
            app: mockApp
        };

        jest.doMock('electron', () => ({
            remote: mockRemote
        }));
    });

    describe('initClose', () => {
        test('should add event listener to close button', () => {
            initClose(mockCloseBtn);

            expect(mockCloseBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('should call promptForPassword when close button is clicked', async () => {
            promptForPassword.mockResolvedValue(true);

            initClose(mockCloseBtn);

            // Get the click handler
            const clickHandler = mockCloseBtn.addEventListener.mock.calls[0][1];

            // Execute the handler
            await clickHandler();

            expect(promptForPassword).toHaveBeenCalled();
        });        test('should close window and quit app when password is correct', async () => {
            promptForPassword.mockResolvedValue(true);

            initClose(mockCloseBtn);

            const clickHandler = mockCloseBtn.addEventListener.mock.calls[0][1];
            await clickHandler();

            expect(window.close).toHaveBeenCalled();
            
            // Check that @electron/remote app.quit was called
            const { app } = require('@electron/remote');
            expect(app.quit).toHaveBeenCalled();
        });

        test('should not close when password is incorrect', async () => {
            promptForPassword.mockResolvedValue(false);

            initClose(mockCloseBtn);

            const clickHandler = mockCloseBtn.addEventListener.mock.calls[0][1];
            await clickHandler();

            expect(window.close).not.toHaveBeenCalled();
            expect(mockApp.quit).not.toHaveBeenCalled();
        });        test('should handle electron modules gracefully', async () => {
            promptForPassword.mockResolvedValue(true);

            initClose(mockCloseBtn);

            const clickHandler = mockCloseBtn.addEventListener.mock.calls[0][1];
            await clickHandler();

            expect(window.close).toHaveBeenCalled();
            // The app.quit() will be called through the mocked @electron/remote
            const { app } = require('@electron/remote');
            expect(app.quit).toHaveBeenCalled();
        });        test('should handle async password prompt correctly', async () => {
            // Test with a delayed password prompt
            promptForPassword.mockImplementation(() => 
                new Promise(resolve => setTimeout(() => resolve(true), 100))
            );

            initClose(mockCloseBtn);

            const clickHandler = mockCloseBtn.addEventListener.mock.calls[0][1];
            
            const startTime = Date.now();
            await clickHandler();
            const endTime = Date.now();

            // Should wait for password prompt to complete
            expect(endTime - startTime).toBeGreaterThanOrEqual(100);
            expect(window.close).toHaveBeenCalled();
        });

        test('should handle password prompt rejection', async () => {
            promptForPassword.mockRejectedValue(new Error('Password prompt failed'));

            initClose(mockCloseBtn);

            const clickHandler = mockCloseBtn.addEventListener.mock.calls[0][1];

            // Should handle rejection gracefully
            await expect(clickHandler()).rejects.toThrow('Password prompt failed');
            
            expect(window.close).not.toHaveBeenCalled();
            expect(mockApp.quit).not.toHaveBeenCalled();
        });
    });
});
