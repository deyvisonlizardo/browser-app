// Mock for electron module
module.exports = {
    app: {
        getPath: jest.fn(() => '/mock/userData'),
        whenReady: jest.fn(() => Promise.resolve()),
        quit: jest.fn(),
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
    Menu: {
        setApplicationMenu: jest.fn(),
        buildFromTemplate: jest.fn()
    },
    MenuItem: jest.fn(),
    ipcMain: {
        on: jest.fn(),
        once: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn(),
        handle: jest.fn(),
        handleOnce: jest.fn()
    },
    ipcRenderer: {
        send: jest.fn(),
        sendSync: jest.fn(),
        on: jest.fn(),
        once: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn(),
        invoke: jest.fn(() => Promise.resolve())
    },
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
    }
};
