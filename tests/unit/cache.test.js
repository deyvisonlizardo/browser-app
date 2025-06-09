// Unit tests for cache.js module
const { initCacheClear, cleanup } = require('../../scripts/renderer/cache.js');

describe('Cache Module', () => {
    let mockClearCacheBtn, mockWebview, mockDropdownMenu;
    let mockSession;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock DOM elements
        mockClearCacheBtn = {
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };

        mockWebview = {
            reload: jest.fn(),
            getURL: jest.fn(() => 'https://example.com')
        };

        mockDropdownMenu = {
            classList: {
                remove: jest.fn()
            }
        };

        // Mock session
        mockSession = {
            defaultSession: {
                clearCache: jest.fn(() => Promise.resolve()),
                clearStorageData: jest.fn(() => Promise.resolve()),
                clearCodeCaches: jest.fn(() => Promise.resolve()),
                clearAuthCache: jest.fn(() => Promise.resolve()),
                clearHostResolverCache: jest.fn(() => Promise.resolve())
            }
        };

        // Mock require for @electron/remote
        jest.doMock('@electron/remote', () => ({
            session: mockSession
        }));

        // Mock document methods
        document.getElementById = jest.fn((id) => {
            if (id === 'clear-cache-btn') return mockClearCacheBtn;
            if (id === 'browser-frame') return mockWebview;
            return null;
        });

        document.querySelector = jest.fn((selector) => {
            if (selector === '.tab.active') {
                return { dataset: { tabId: '1' } };
            }
            return null;
        });
    });

    describe('initCacheClear', () => {
        test('should add event listener to clear cache button', () => {
            initCacheClear(mockClearCacheBtn, mockWebview, mockDropdownMenu);
            
            expect(mockClearCacheBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('should remove existing listener before adding new one', () => {
            // Initialize twice to test removal
            initCacheClear(mockClearCacheBtn, mockWebview, mockDropdownMenu);
            initCacheClear(mockClearCacheBtn, mockWebview, mockDropdownMenu);
            
            expect(mockClearCacheBtn.removeEventListener).toHaveBeenCalled();
            expect(mockClearCacheBtn.addEventListener).toHaveBeenCalledTimes(2);
        });

        test('should handle cache clearing operation', async () => {
            // Mock console methods
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            initCacheClear(mockClearCacheBtn, mockWebview, mockDropdownMenu);
            
            // Get the click handler
            const clickHandler = mockClearCacheBtn.addEventListener.mock.calls[0][1];
            
            // Execute the handler
            await clickHandler();
            
            // Verify cache operations were called
            expect(mockSession.defaultSession.clearCache).toHaveBeenCalled();
            expect(mockSession.defaultSession.clearStorageData).toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });

        test('should reload webview after clearing cache', async () => {
            initCacheClear(mockClearCacheBtn, mockWebview, mockDropdownMenu);
            
            const clickHandler = mockClearCacheBtn.addEventListener.mock.calls[0][1];
            await clickHandler();
            
            expect(mockWebview.reload).toHaveBeenCalled();
        });

        test('should close dropdown menu after operation', async () => {
            initCacheClear(mockClearCacheBtn, mockWebview, mockDropdownMenu);
            
            const clickHandler = mockClearCacheBtn.addEventListener.mock.calls[0][1];
            await clickHandler();
            
            expect(mockDropdownMenu.classList.remove).toHaveBeenCalledWith('show');
        });        test('should handle errors gracefully', async () => {
            // Instead of mocking require, let's mock the imported module functions directly
            const { session } = require('@electron/remote');
            session.defaultSession.clearCache.mockRejectedValue(new Error('Mock cache error'));
            
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            
            initCacheClear(mockClearCacheBtn, mockWebview, mockDropdownMenu);
            
            const clickHandler = mockClearCacheBtn.addEventListener.mock.calls[0][1];
            await clickHandler();
            
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Error clearing browser data:'),
                expect.any(Error)
            );
            
            consoleErrorSpy.mockRestore();
            
            // Reset the mock for other tests
            session.defaultSession.clearCache.mockResolvedValue();
        });
    });

    describe('cleanup', () => {
        test('should remove event listener from clear cache button', () => {
            // Initialize first
            initCacheClear(mockClearCacheBtn, mockWebview, mockDropdownMenu);
            
            // Then cleanup
            cleanup();
            
            expect(mockClearCacheBtn.removeEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('should handle cleanup when no button exists', () => {
            document.getElementById = jest.fn(() => null);
            
            expect(() => cleanup()).not.toThrow();
        });
    });
});
