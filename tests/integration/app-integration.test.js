// Integration tests for main application functionality
const { app, BrowserWindow } = require('electron');
const path = require('path');

describe('Integration Tests - Main Application', () => {
    let mainWindow;

    beforeAll(async () => {
        // Wait for app to be ready
        await app.whenReady();
    });

    afterAll(async () => {
        // Clean up
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.close();
        }
        if (app && typeof app.quit === 'function') {
            app.quit();
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Window Creation and Loading', () => {
        test('should create main window successfully', async () => {
            mainWindow = new BrowserWindow({
                width: 1200,
                height: 800,
                show: false,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    webviewTag: true,
                    enableRemoteModule: true,
                    webSecurity: false,
                },
            });

            expect(mainWindow).toBeDefined();
            expect(mainWindow.isDestroyed()).toBe(false);
        });

        test('should load index.html', async () => {
            const indexPath = path.join(__dirname, '../../index.html');
            
            await mainWindow.loadFile(indexPath);
            
            const url = mainWindow.webContents.getURL();
            expect(url).toContain('index.html');
        });

        test('should have correct webPreferences', () => {
            const webPreferences = mainWindow.webContents.getWebPreferences();
            
            expect(webPreferences.nodeIntegration).toBe(true);
            expect(webPreferences.contextIsolation).toBe(false);
            expect(webPreferences.webviewTag).toBe(true);
        });
    });

    describe('DOM Elements Loading', () => {
        test('should load all required navigation elements', async () => {
            const result = await mainWindow.webContents.executeJavaScript(`
                ({
                    backBtn: !!document.getElementById('back-btn'),
                    forwardBtn: !!document.getElementById('forward-btn'),
                    refreshBtn: !!document.getElementById('refresh-btn'),
                    urlBar: !!document.getElementById('url-bar'),
                    menuBtn: !!document.getElementById('menu-btn'),
                    webview: !!document.getElementById('browser-frame')
                })
            `);

            expect(result.backBtn).toBe(true);
            expect(result.forwardBtn).toBe(true);
            expect(result.refreshBtn).toBe(true);
            expect(result.urlBar).toBe(true);
            expect(result.menuBtn).toBe(true);
            expect(result.webview).toBe(true);
        });

        test('should load dropdown menu elements', async () => {
            const result = await mainWindow.webContents.executeJavaScript(`
                ({
                    dropdownMenu: !!document.getElementById('dropdown-menu'),
                    clearCacheBtn: !!document.getElementById('clear-cache-btn'),
                    settingsBtn: !!document.getElementById('settings-btn'),
                    closeBtn: !!document.getElementById('close-btn')
                })
            `);

            expect(result.dropdownMenu).toBe(true);
            expect(result.clearCacheBtn).toBe(true);
            expect(result.settingsBtn).toBe(true);
            expect(result.closeBtn).toBe(true);
        });

        test('should load tab management elements', async () => {
            const result = await mainWindow.webContents.executeJavaScript(`
                ({
                    tabBar: !!document.getElementById('tab-bar'),
                    addTabBtn: !!document.getElementById('add-tab-btn'),
                    hasInitialTab: document.querySelectorAll('.tab').length > 0
                })
            `);

            expect(result.tabBar).toBe(true);
            expect(result.addTabBtn).toBe(true);
            expect(result.hasInitialTab).toBe(true);
        });
    });

    describe('CSS and Styling', () => {
        test('should load main CSS file', async () => {
            const result = await mainWindow.webContents.executeJavaScript(`
                Array.from(document.styleSheets).some(sheet => 
                    sheet.href && sheet.href.includes('main.css')
                )
            `);

            expect(result).toBe(true);
        });

        test('should have CSS variables defined', async () => {
            const result = await mainWindow.webContents.executeJavaScript(`
                {
                    const styles = getComputedStyle(document.documentElement);
                    return {
                        primaryColor: styles.getPropertyValue('--color-primary').trim(),
                        bgLight: styles.getPropertyValue('--color-bg-light').trim(),
                        bgDark: styles.getPropertyValue('--color-bg-dark').trim()
                    };
                }
            `);

            expect(result.primaryColor).toBeTruthy();
            expect(result.bgLight).toBeTruthy();
            expect(result.bgDark).toBeTruthy();
        });
    });

    describe('Module Loading', () => {
        test('should load renderer script successfully', async () => {
            // Check if modules are loaded by testing for global functions/objects
            const result = await mainWindow.webContents.executeJavaScript(`
                ({
                    hasModules: typeof window !== 'undefined',
                    hasWebview: !!document.getElementById('browser-frame'),
                    scriptsLoaded: document.querySelectorAll('script[type="module"]').length > 0
                })
            `);

            expect(result.hasModules).toBe(true);
            expect(result.hasWebview).toBe(true);
            expect(result.scriptsLoaded).toBe(true);
        });
    });

    describe('Interactive Elements', () => {
        test('should be able to interact with navigation buttons', async () => {
            const result = await mainWindow.webContents.executeJavaScript(`
                {
                    const backBtn = document.getElementById('back-btn');
                    const forwardBtn = document.getElementById('forward-btn');
                    const refreshBtn = document.getElementById('refresh-btn');
                    
                    return {
                        backBtnClickable: backBtn && typeof backBtn.click === 'function',
                        forwardBtnClickable: forwardBtn && typeof forwardBtn.click === 'function',
                        refreshBtnClickable: refreshBtn && typeof refreshBtn.click === 'function'
                    };
                }
            `);

            expect(result.backBtnClickable).toBe(true);
            expect(result.forwardBtnClickable).toBe(true);
            expect(result.refreshBtnClickable).toBe(true);
        });

        test('should be able to interact with dropdown menu', async () => {
            const result = await mainWindow.webContents.executeJavaScript(`
                {
                    const menuBtn = document.getElementById('menu-btn');
                    const dropdownMenu = document.getElementById('dropdown-menu');
                    
                    return {
                        menuBtnExists: !!menuBtn,
                        dropdownExists: !!dropdownMenu,
                        menuBtnClickable: menuBtn && typeof menuBtn.click === 'function'
                    };
                }
            `);

            expect(result.menuBtnExists).toBe(true);
            expect(result.dropdownExists).toBe(true);
            expect(result.menuBtnClickable).toBe(true);
        });
    });
});
