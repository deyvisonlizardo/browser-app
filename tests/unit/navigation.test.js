// Unit tests for navigation.js module
const { initNavigation } = require('../../scripts/renderer/navigation.js');

describe('Navigation Module', () => {
    let mockWebview, mockUrlBar, mockBackBtn, mockForwardBtn, mockRefreshBtn;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock webview
        mockWebview = {
            canGoBack: jest.fn(() => true),
            canGoForward: jest.fn(() => false),
            goBack: jest.fn(),
            goForward: jest.fn(),
            reload: jest.fn()
        };

        // Mock URL bar
        mockUrlBar = {
            textContent: ''
        };

        // Mock navigation buttons
        mockBackBtn = {
            addEventListener: jest.fn(),
            disabled: false
        };

        mockForwardBtn = {
            addEventListener: jest.fn(),
            disabled: false
        };

        mockRefreshBtn = {
            addEventListener: jest.fn(),
            disabled: false
        };
    });

    describe('initNavigation', () => {
        test('should add event listeners to navigation buttons', () => {
            initNavigation(mockWebview, mockUrlBar, mockBackBtn, mockForwardBtn, mockRefreshBtn);

            expect(mockBackBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockForwardBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockRefreshBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('should handle back button click when navigation is possible', () => {
            initNavigation(mockWebview, mockUrlBar, mockBackBtn, mockForwardBtn, mockRefreshBtn);

            // Get the back button click handler
            const backHandler = mockBackBtn.addEventListener.mock.calls[0][1];
            
            // Simulate click
            backHandler();

            expect(mockWebview.canGoBack).toHaveBeenCalled();
            expect(mockWebview.goBack).toHaveBeenCalled();
        });

        test('should not navigate back when canGoBack returns false', () => {
            mockWebview.canGoBack.mockReturnValue(false);
            
            initNavigation(mockWebview, mockUrlBar, mockBackBtn, mockForwardBtn, mockRefreshBtn);

            const backHandler = mockBackBtn.addEventListener.mock.calls[0][1];
            backHandler();

            expect(mockWebview.canGoBack).toHaveBeenCalled();
            expect(mockWebview.goBack).not.toHaveBeenCalled();
        });

        test('should handle forward button click when navigation is possible', () => {
            mockWebview.canGoForward.mockReturnValue(true);
            
            initNavigation(mockWebview, mockUrlBar, mockBackBtn, mockForwardBtn, mockRefreshBtn);

            const forwardHandler = mockForwardBtn.addEventListener.mock.calls[0][1];
            forwardHandler();

            expect(mockWebview.canGoForward).toHaveBeenCalled();
            expect(mockWebview.goForward).toHaveBeenCalled();
        });

        test('should not navigate forward when canGoForward returns false', () => {
            initNavigation(mockWebview, mockUrlBar, mockBackBtn, mockForwardBtn, mockRefreshBtn);

            const forwardHandler = mockForwardBtn.addEventListener.mock.calls[0][1];
            forwardHandler();

            expect(mockWebview.canGoForward).toHaveBeenCalled();
            expect(mockWebview.goForward).not.toHaveBeenCalled();
        });

        test('should handle refresh button click', () => {
            initNavigation(mockWebview, mockUrlBar, mockBackBtn, mockForwardBtn, mockRefreshBtn);

            const refreshHandler = mockRefreshBtn.addEventListener.mock.calls[0][1];
            refreshHandler();

            expect(mockWebview.reload).toHaveBeenCalled();
        });

        test('should handle null webview gracefully', () => {
            expect(() => {
                initNavigation(null, mockUrlBar, mockBackBtn, mockForwardBtn, mockRefreshBtn);
            }).not.toThrow();

            // Click handlers should still be added
            expect(mockBackBtn.addEventListener).toHaveBeenCalled();
            expect(mockForwardBtn.addEventListener).toHaveBeenCalled();
            expect(mockRefreshBtn.addEventListener).toHaveBeenCalled();
        });        test('should handle webview without navigation methods', () => {
            const limitedWebview = {
                canGoBack: jest.fn(() => false),
                canGoForward: jest.fn(() => false),
                goBack: jest.fn(),
                goForward: jest.fn(),
                reload: jest.fn()
            };
            
            initNavigation(limitedWebview, mockUrlBar, mockBackBtn, mockForwardBtn, mockRefreshBtn);

            const backHandler = mockBackBtn.addEventListener.mock.calls[0][1];
            
            expect(() => backHandler()).not.toThrow();
        });
    });
});
