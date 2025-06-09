// Unit tests for dropdown.js module
const { initDropdown } = require('../../scripts/renderer/dropdown.js');

describe('Dropdown Module', () => {
    let mockMenuBtn, mockDropdownMenu, mockWebviewField;
    let documentEventListeners;

    beforeEach(() => {
        jest.clearAllMocks();

        // Track event listeners added to document
        documentEventListeners = {};

        // Mock DOM elements
        mockMenuBtn = {
            contains: jest.fn()
        };

        mockDropdownMenu = {
            classList: {
                toggle: jest.fn(),
                remove: jest.fn()
            },
            contains: jest.fn()
        };

        mockWebviewField = {
            addEventListener: jest.fn()
        };

        // Mock document.addEventListener
        document.addEventListener = jest.fn((event, handler) => {
            documentEventListeners[event] = handler;
        });
    });

    describe('initDropdown', () => {
        test('should add click event listener to document', () => {
            initDropdown(mockMenuBtn, mockDropdownMenu, mockWebviewField);

            expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('should toggle dropdown when menu button is clicked', () => {
            mockMenuBtn.contains.mockReturnValue(true);

            initDropdown(mockMenuBtn, mockDropdownMenu, mockWebviewField);

            // Simulate click event
            const clickHandler = documentEventListeners.click;
            const mockEvent = { target: document.createElement('div') };
            
            clickHandler(mockEvent);

            expect(mockMenuBtn.contains).toHaveBeenCalledWith(mockEvent.target);
            expect(mockDropdownMenu.classList.toggle).toHaveBeenCalledWith('show');
        });

        test('should close dropdown when clicking outside', () => {
            mockMenuBtn.contains.mockReturnValue(false);
            mockDropdownMenu.contains.mockReturnValue(false);

            initDropdown(mockMenuBtn, mockDropdownMenu, mockWebviewField);

            // Simulate click event outside dropdown
            const clickHandler = documentEventListeners.click;
            const mockEvent = { target: document.createElement('div') };
            
            clickHandler(mockEvent);

            expect(mockDropdownMenu.classList.remove).toHaveBeenCalledWith('show');
            expect(mockDropdownMenu.classList.toggle).not.toHaveBeenCalled();
        });

        test('should not close dropdown when clicking inside dropdown', () => {
            mockMenuBtn.contains.mockReturnValue(false);
            mockDropdownMenu.contains.mockReturnValue(true);

            initDropdown(mockMenuBtn, mockDropdownMenu, mockWebviewField);

            const clickHandler = documentEventListeners.click;
            const mockEvent = { target: document.createElement('div') };
            
            clickHandler(mockEvent);

            expect(mockDropdownMenu.classList.remove).not.toHaveBeenCalled();
            expect(mockDropdownMenu.classList.toggle).not.toHaveBeenCalled();
        });

        test('should add focus event listener to webview field', () => {
            initDropdown(mockMenuBtn, mockDropdownMenu, mockWebviewField);

            expect(mockWebviewField.addEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
        });

        test('should add mousedown event listener to webview field', () => {
            initDropdown(mockMenuBtn, mockDropdownMenu, mockWebviewField);

            expect(mockWebviewField.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
        });

        test('should close dropdown on webview focus', () => {
            initDropdown(mockMenuBtn, mockDropdownMenu, mockWebviewField);

            // Get the focus handler and execute it
            const focusCall = mockWebviewField.addEventListener.mock.calls.find(call => call[0] === 'focus');
            const focusHandler = focusCall[1];
            
            focusHandler();

            expect(mockDropdownMenu.classList.remove).toHaveBeenCalledWith('show');
        });

        test('should close dropdown on webview mousedown', () => {
            initDropdown(mockMenuBtn, mockDropdownMenu, mockWebviewField);

            // Get the mousedown handler and execute it
            const mousedownCall = mockWebviewField.addEventListener.mock.calls.find(call => call[0] === 'mousedown');
            const mousedownHandler = mousedownCall[1];
            
            mousedownHandler();

            expect(mockDropdownMenu.classList.remove).toHaveBeenCalledWith('show');
        });

        test('should handle null webview field gracefully', () => {
            expect(() => {
                initDropdown(mockMenuBtn, mockDropdownMenu, null);
            }).not.toThrow();

            // Should still add document click listener
            expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('should handle multiple clicks on menu button', () => {
            mockMenuBtn.contains.mockReturnValue(true);

            initDropdown(mockMenuBtn, mockDropdownMenu, mockWebviewField);

            const clickHandler = documentEventListeners.click;
            const mockEvent = { target: document.createElement('div') };
            
            // First click
            clickHandler(mockEvent);
            expect(mockDropdownMenu.classList.toggle).toHaveBeenCalledTimes(1);

            // Second click
            clickHandler(mockEvent);
            expect(mockDropdownMenu.classList.toggle).toHaveBeenCalledTimes(2);
        });
    });
});
