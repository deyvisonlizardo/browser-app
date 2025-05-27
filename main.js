const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        fullscreen: true,           // Start in fullscreen
        alwaysOnTop: true,          // Stay above all other apps
        webPreferences: {
            nodeIntegration: true, // Needed for require in renderer
            contextIsolation: false,
            webviewTag: true, // Enable <webview> tag
        },
    });

    win.loadFile('index.html') // Load your HTML file

    // Remove the default menu
    Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});