// Unit tests for notification.js module
const { showNotification } = require('../../scripts/renderer/notification.js');

describe('Notification Module', () => {
    let mockNotificationElement;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock setTimeout and clearTimeout
        jest.useFakeTimers();        mockNotificationElement = {
            id: 'notification',
            style: { display: 'none' },
            textContent: ''
        };

        // Mock DOM methods
        document.getElementById = jest.fn((id) => {
            if (id === 'notification') return mockNotificationElement;
            return null;
        });

        document.createElement = jest.fn(() => ({
            id: '',
            style: {},
            textContent: ''
        }));

        document.body = {
            appendChild: jest.fn()
        };
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('showNotification', () => {
        test('should create notification element if it does not exist', () => {
            document.getElementById = jest.fn(() => null); // No existing notification

            const createdElement = {
                id: '',
                style: {},
                textContent: ''
            };

            document.createElement = jest.fn(() => createdElement);

            showNotification('Test message');

            expect(document.createElement).toHaveBeenCalledWith('div');
            expect(createdElement.id).toBe('notification');
            expect(document.body.appendChild).toHaveBeenCalledWith(createdElement);
        });

        test('should reuse existing notification element', () => {
            showNotification('Test message');

            expect(document.createElement).not.toHaveBeenCalled();
            expect(document.body.appendChild).not.toHaveBeenCalled();
        });

        test('should set notification message', () => {
            showNotification('Hello World');

            expect(mockNotificationElement.textContent).toBe('Hello World');
        });

        test('should show notification by setting display to block', () => {
            showNotification('Test message');

            expect(mockNotificationElement.style.display).toBe('block');
        });

        test('should hide notification after default duration (2000ms)', () => {
            showNotification('Test message');

            // Initially visible
            expect(mockNotificationElement.style.display).toBe('block');

            // Fast-forward time
            jest.advanceTimersByTime(2000);

            // Should be hidden now
            expect(mockNotificationElement.style.display).toBe('none');
        });

        test('should hide notification after custom duration', () => {
            showNotification('Test message', 5000);

            // Initially visible
            expect(mockNotificationElement.style.display).toBe('block');

            // Fast-forward less than custom duration
            jest.advanceTimersByTime(3000);
            expect(mockNotificationElement.style.display).toBe('block');

            // Fast-forward to custom duration
            jest.advanceTimersByTime(2000);
            expect(mockNotificationElement.style.display).toBe('none');
        });

        test('should style notification element correctly on creation', () => {
            document.getElementById = jest.fn(() => null);

            const createdElement = {
                id: '',
                style: {},
                textContent: ''
            };

            document.createElement = jest.fn(() => createdElement);

            showNotification('Test message');

            expect(createdElement.style.position).toBe('fixed');
            expect(createdElement.style.top).toBe('80px');
            expect(createdElement.style.left).toBe('50%');
            expect(createdElement.style.transform).toBe('translateX(-50%)');
            expect(createdElement.style.background).toBe('#222');
            expect(createdElement.style.color).toBe('#fff');
            expect(createdElement.style.padding).toBe('10px 24px');
            expect(createdElement.style.borderRadius).toBe('6px');
            expect(createdElement.style.zIndex).toBe('9999');
            expect(createdElement.style.boxShadow).toBe('0 2px 8px rgba(0,0,0,0.5)');
        });

        test('should handle multiple consecutive notifications', () => {
            showNotification('First message');
            expect(mockNotificationElement.textContent).toBe('First message');

            showNotification('Second message');
            expect(mockNotificationElement.textContent).toBe('Second message');
            expect(mockNotificationElement.style.display).toBe('block');
        });

        test('should handle zero duration', () => {
            showNotification('Test message', 0);

            expect(mockNotificationElement.style.display).toBe('block');

            jest.advanceTimersByTime(0);

            expect(mockNotificationElement.style.display).toBe('none');
        });
    });
});
