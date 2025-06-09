// Jest setup file for browser-app tests
const { TestEnvironment } = require('./test-setup');

// Global test environment
global.testEnv = new TestEnvironment();

// Setup global Jest functions
global.jest = jest;

// Mock Node.js require function for ES6 modules
global.require = jest.fn((moduleName) => {
    if (moduleName === '@electron/remote') {
        return require('./__mocks__/electron-remote.js');
    }
    if (moduleName === 'electron') {
        return require('./__mocks__/electron.js');
    }
    if (moduleName === 'fs') {
        return {
            readFileSync: jest.fn(),
            writeFileSync: jest.fn(),
            existsSync: jest.fn(() => true),
            mkdirSync: jest.fn()
        };
    }
    if (moduleName === 'path') {
        return {
            join: jest.fn((...args) => args.join('/')),
            dirname: jest.fn(),
            basename: jest.fn(),
            extname: jest.fn()
        };
    }
    return {};
});

// Mock Electron modules for ES6 imports
jest.doMock('electron', () => require('./jest.setup.__mocks__/electron.js'));
jest.doMock('@electron/remote', () => require('./jest.setup.__mocks__/electron-remote.js'));

// Mock DOM environment for renderer tests
const mockElement = {
    id: '',
    className: '',
    style: {},
    innerHTML: '',
    textContent: '',
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    click: jest.fn(),
    focus: jest.fn(),
    blur: jest.fn()
};

global.document = {
    getElementById: jest.fn(() => mockElement),
    createElement: jest.fn(() => ({...mockElement})),
    addEventListener: jest.fn(),
    querySelector: jest.fn(() => mockElement),
    querySelectorAll: jest.fn(() => [mockElement]),
    body: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
        ...mockElement
    },
    readyState: 'complete'
};

global.window = {
    location: {
        href: 'file:///mock/index.html',
        protocol: 'file:',
        pathname: '/mock/index.html'
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    close: jest.fn(),
    open: jest.fn(),
    document: global.document
};

// Cleanup after all tests
afterAll(async () => {
    if (global.testEnv) {
        await global.testEnv.cleanup();
    }
});
