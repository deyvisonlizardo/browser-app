const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const remoteMain = require('@electron/remote/main');

function createWindow() {
    const win = new BrowserWindow({
        fullscreen: true,           // Start in fullscreen
        alwaysOnTop: true,          // Stay above all other apps
        webPreferences: {
            nodeIntegration: true, // Needed for require in renderer
            contextIsolation: false,
            webviewTag: true, // Enable <webview> tag
            enableRemoteModule: true, // Required for @electron/remote
        },
    });

    remoteMain.enable(win.webContents);
    win.loadFile('index.html') // Load your HTML file

    // Remove the default menu
    Menu.setApplicationMenu(null);
}

app.whenReady().then(() => {
    remoteMain.initialize();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});