// Test setup and utilities for browser-app testing
// This file provides utilities for setting up test environments

const { app, BrowserWindow } = require('electron');
const path = require('path');

class TestEnvironment {
    constructor() {
        this.testWindow = null;
    }

    async createTestWindow() {
        if (this.testWindow) {
            this.testWindow.close();
        }

        this.testWindow = new BrowserWindow({
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

        const indexPath = path.join(__dirname, '../../index.html');
        await this.testWindow.loadFile(indexPath);
        
        return this.testWindow;
    }

    async cleanup() {
        if (this.testWindow) {
            this.testWindow.close();
            this.testWindow = null;
        }
    }

    // Utility to execute JavaScript in the renderer process
    async executeInRenderer(script) {
        if (!this.testWindow) {
            throw new Error('Test window not created. Call createTestWindow() first.');
        }
        
        return await this.testWindow.webContents.executeJavaScript(script);
    }

    // Utility to wait for DOM ready
    async waitForDOMReady() {
        return await this.executeInRenderer(`
            new Promise((resolve) => {
                if (document.readyState === 'complete') {
                    resolve(true);
                } else {
                    window.addEventListener('load', () => resolve(true));
                }
            })
        `);
    }

    // Mock webview for testing
    createMockWebview() {
        return {
            canGoBack: () => false,
            canGoForward: () => false,
            goBack: jest.fn(),
            goForward: jest.fn(),
            reload: jest.fn(),
            loadURL: jest.fn(),
            getURL: () => 'https://example.com',
            executeJavaScript: jest.fn().mockResolvedValue(''),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            style: { display: 'block' },
            remove: jest.fn()
        };
    }
}

module.exports = { TestEnvironment };
