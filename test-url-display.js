// Test script to verify URL display on startup
const { app, BrowserWindow } = require('electron');
const remoteMain = require('@electron/remote/main');

// Test URL display on startup
async function testUrlDisplay() {
    console.log('🧪 Starting URL display test...');
    
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false, // Don't show the window, just load and test
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true,
            enableRemoteModule: true,
            allowRunningInsecureContent: true,
            webSecurity: false,
        },
    });

    // Enable remote module
    remoteMain.enable(win.webContents);
    
    win.loadFile('index.html');
    
    // Wait for the renderer to load
    win.webContents.once('dom-ready', async () => {
        console.log('🔄 DOM ready, waiting for renderer initialization...');
        
        // Give more time for the renderer.js to initialize
        setTimeout(async () => {
            try {
                console.log('🔍 Checking URL bar content...');
                
                // Check if URL bar has content
                const urlBarContent = await win.webContents.executeJavaScript(`
                    (function() {
                        const urlBar = document.getElementById('url-bar');
                        console.log('URL bar element:', urlBar);
                        return urlBar ? urlBar.textContent : 'URL_BAR_NOT_FOUND';
                    })()
                `);
                
                console.log('📊 URL bar content:', JSON.stringify(urlBarContent));
                
                if (urlBarContent && urlBarContent.includes('icbeutechzone.com')) {
                    console.log('✅ SUCCESS: URL bar shows default URL on startup');
                    console.log('   Expected: URL containing "icbeutechzone.com"');
                    console.log('   Actual:', urlBarContent);
                } else {
                    console.log('❌ FAILURE: URL bar does not show default URL on startup');
                    console.log('   Expected: URL containing "icbeutechzone.com"');
                    console.log('   Actual:', urlBarContent);
                }
                
                // Test complete
                console.log('🏁 Test completed, closing app...');
                setTimeout(() => app.quit(), 500);
                
            } catch (error) {
                console.error('❌ Error testing URL display:', error);
                setTimeout(() => app.quit(), 500);
            }
        }, 2000); // Increased timeout to 2 seconds
    });

    win.webContents.on('console-message', (event, level, message) => {
        console.log(`[RENDERER]: ${message}`);
    });
}

// Initialize remote module
remoteMain.initialize();

app.whenReady().then(testUrlDisplay);

app.on('window-all-closed', () => {
    app.quit();
});

// Add timeout to prevent hanging
setTimeout(() => {
    console.log('⏰ Test timeout reached, forcing exit...');
    app.quit();
}, 10000);
