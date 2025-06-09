// Mock for @electron/remote module
module.exports = {
    app: {
        getPath: jest.fn(() => '/mock/userData'),
        getVersion: jest.fn(() => '1.0.0'),
        getName: jest.fn(() => 'BrowserApp'),
        quit: jest.fn(),
        exit: jest.fn(),
        on: jest.fn(),
        emit: jest.fn()
    },
    BrowserWindow: jest.fn(() => ({
        loadFile: jest.fn(),
        loadURL: jest.fn(),
        webContents: {
            executeJavaScript: jest.fn(() => Promise.resolve()),
            send: jest.fn(),
            on: jest.fn(),
            openDevTools: jest.fn()
        },
        close: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        removeAllListeners: jest.fn()
    })),
    getCurrentWindow: jest.fn(() => ({
        close: jest.fn(),
        minimize: jest.fn(),
        maximize: jest.fn(),
        restore: jest.fn(),
        isMaximized: jest.fn(() => false),
        isMinimized: jest.fn(() => false),
        webContents: {
            executeJavaScript: jest.fn(() => Promise.resolve()),
            send: jest.fn(),
            on: jest.fn()
        }
    })),
    session: {
        defaultSession: {
            clearCache: jest.fn(() => Promise.resolve()),
            clearStorageData: jest.fn(() => Promise.resolve()),
            clearCodeCaches: jest.fn(() => Promise.resolve()),
            clearAuthCache: jest.fn(() => Promise.resolve()),
            clearHostResolverCache: jest.fn(() => Promise.resolve()),
            webRequest: {
                onBeforeRequest: jest.fn(),
                onCompleted: jest.fn()
            }
        }
    },
    require: jest.fn((module) => {
        if (module === 'fs') {
            return {
                readFileSync: jest.fn(),
                writeFileSync: jest.fn(),
                existsSync: jest.fn(() => true),
                mkdirSync: jest.fn()
            };
        }
        if (module === 'path') {
            return {
                join: jest.fn((...args) => args.join('/')),
                dirname: jest.fn(),
                basename: jest.fn(),
                extname: jest.fn()
            };
        }
        return {};
    })
};
