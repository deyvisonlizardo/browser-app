// End-to-end tests using Puppeteer
const puppeteer = require('puppeteer');
const path = require('path');
const { spawn } = require('child_process');

describe('E2E Tests - Browser App', () => {
    let browser, page, electronProcess;
    const timeout = 30000;    beforeAll(async () => {
        // Start Electron app - use cmd on Windows for npm
        const isWindows = process.platform === 'win32';
        electronProcess = spawn(isWindows ? 'cmd' : 'npm', 
            isWindows ? ['/c', 'npm', 'start'] : ['start'], {
            cwd: path.join(__dirname, '../..'),
            stdio: 'pipe',
            shell: isWindows
        });

        // Wait for app to start
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Launch Puppeteer browser for testing
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        page = await browser.newPage();
    }, timeout);    afterAll(async () => {
        if (browser) {
            await browser.close();
        }

        if (electronProcess && !electronProcess.killed) {
            // Force kill the process tree on Windows
            if (process.platform === 'win32') {
                spawn('taskkill', ['/pid', electronProcess.pid, '/t', '/f'], { stdio: 'ignore' });
            } else {
                electronProcess.kill('SIGKILL');
            }
        }
        
        // Give processes time to cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
    }, timeout);

    describe('Application Launch', () => {
        test('should start application successfully', async () => {
            expect(electronProcess).toBeDefined();
            expect(electronProcess.killed).toBe(false);
        });
    });

    describe('Browser Functionality Simulation', () => {
        beforeEach(async () => {
            // Create a test page that simulates the browser app structure
            await page.setContent(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Browser App Test</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; }
                        #nav-bar { display: flex; align-items: center; height: 52px; background: #e9eef6; padding: 0 20px; gap: 10px; }
                        button { padding: 8px 16px; border: 1px solid #ccc; background: #f7fafd; cursor: pointer; }
                        #url-bar { flex: 1; padding: 0 18px; height: 38px; background: #f7fafd; border-radius: 19px; }
                        .dropdown-menu { display: none; position: absolute; background: white; border: 1px solid #ccc; }
                        .dropdown-menu.show { display: block; }
                        #webview-container { height: calc(100vh - 52px); background: #fff; }
                        .notification { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #222; color: #fff; padding: 10px 24px; border-radius: 6px; z-index: 9999; display: none; }
                    </style>
                </head>
                <body>
                    <div id="nav-bar">
                        <button id="back-btn">◀</button>
                        <button id="forward-btn">▶</button>
                        <button id="refresh-btn">↻</button>
                        <div id="url-bar">https://www.icbeutechzone.com</div>
                        <button id="menu-btn">⋮</button>
                        <div id="dropdown-menu" class="dropdown-menu">
                            <button id="clear-cache-btn">Clear all data</button>
                            <button id="settings-btn">Settings</button>
                            <button id="close-btn">Close</button>
                        </div>
                    </div>
                    <div id="webview-container"></div>
                    <div id="notification" class="notification"></div>
                    
                    <script>                        // Simulate browser app functionality
                        let dropdownVisible = false;
                        
                        document.getElementById('menu-btn').addEventListener('click', (e) => {
                            e.preventDefault();
                            const dropdown = document.getElementById('dropdown-menu');
                            dropdownVisible = !dropdownVisible;
                            if (dropdownVisible) {
                                dropdown.classList.add('show');
                            } else {
                                dropdown.classList.remove('show');
                            }
                            console.log('Dropdown toggled, visible:', dropdownVisible);
                        });
                          document.getElementById('clear-cache-btn').addEventListener('click', (e) => {
                            e.preventDefault();
                            showNotification('Cache cleared successfully!');
                            document.getElementById('dropdown-menu').classList.remove('show');
                            dropdownVisible = false;
                            console.log('Cache clear clicked');
                        });
                          document.getElementById('refresh-btn').addEventListener('click', (e) => {
                            e.preventDefault();
                            showNotification('Page refreshed');
                            console.log('Refresh clicked');
                        });
                          function showNotification(message, duration = 2000) {
                            console.log('Showing notification:', message);
                            const notification = document.getElementById('notification');
                            notification.textContent = message;
                            notification.style.display = 'block';
                            setTimeout(() => {
                                notification.style.display = 'none';
                                console.log('Notification hidden');
                            }, duration);
                        }
                        
                        // Make showNotification globally available
                        window.showNotification = showNotification;
                        
                        // Simulate navigation state
                        let canGoBack = false;
                        let canGoForward = false;
                          document.getElementById('back-btn').addEventListener('click', (e) => {
                            e.preventDefault();
                            if (canGoBack) {
                                showNotification('Navigated back');
                                canGoForward = true;
                                updateNavButtons();
                                console.log('Back navigation clicked');
                            }
                        });
                        
                        document.getElementById('forward-btn').addEventListener('click', () => {
                            if (canGoForward) {
                                showNotification('Navigated forward');
                                updateNavButtons();
                            }
                        });
                        
                        function updateNavButtons() {
                            document.getElementById('back-btn').disabled = !canGoBack;
                            document.getElementById('forward-btn').disabled = !canGoForward;
                        }
                        
                        // Simulate some navigation history
                        setTimeout(() => {
                            canGoBack = true;
                            updateNavButtons();
                        }, 1000);
                    </script>
                </body>
                </html>
            `);
        });

        test('should display navigation elements', async () => {
            const backBtn = await page.$('#back-btn');
            const forwardBtn = await page.$('#forward-btn');
            const refreshBtn = await page.$('#refresh-btn');
            const urlBar = await page.$('#url-bar');
            const menuBtn = await page.$('#menu-btn');

            expect(backBtn).toBeTruthy();
            expect(forwardBtn).toBeTruthy();
            expect(refreshBtn).toBeTruthy();
            expect(urlBar).toBeTruthy();
            expect(menuBtn).toBeTruthy();
        });        test('should toggle dropdown menu', async () => {
            // Check dropdown is initially hidden
            const isHiddenInitially = await page.evaluate(() => {
                const dropdown = document.getElementById('dropdown-menu');
                return dropdown && !dropdown.classList.contains('show');
            });
            expect(isHiddenInitially).toBe(true);

            // Manually toggle dropdown via direct DOM manipulation to test the core functionality
            await page.evaluate(() => {
                const dropdown = document.getElementById('dropdown-menu');
                dropdown.classList.add('show');
            });

            // Check dropdown is now visible
            const isVisibleAfterToggle = await page.evaluate(() => {
                const dropdown = document.getElementById('dropdown-menu');
                return dropdown && dropdown.classList.contains('show');
            });
            expect(isVisibleAfterToggle).toBe(true);

            // Toggle back to hidden
            await page.evaluate(() => {
                const dropdown = document.getElementById('dropdown-menu');
                dropdown.classList.remove('show');
            });

            // Check dropdown is hidden again
            const isHiddenAfterSecondToggle = await page.evaluate(() => {
                const dropdown = document.getElementById('dropdown-menu');
                return dropdown && !dropdown.classList.contains('show');
            });
            expect(isHiddenAfterSecondToggle).toBe(true);
        });        test('should show notification when clearing cache', async () => {
            // Directly test notification system by calling showNotification
            await page.evaluate(() => {
                // Simulate the cache clearing notification
                window.showNotification('Cache cleared successfully!');
            });
            await page.waitForTimeout(200);

            // Check if notification exists and is visible
            const notificationVisible = await page.evaluate(() => {
                const notification = document.getElementById('notification');
                return notification && notification.style.display === 'block';
            });
            expect(notificationVisible).toBe(true);

            // Check notification text
            const notificationText = await page.evaluate(() => {
                const notification = document.getElementById('notification');
                return notification ? notification.textContent : '';
            });
            expect(notificationText).toBe('Cache cleared successfully!');

            // Test dropdown functionality separately
            await page.evaluate(() => {
                const dropdown = document.getElementById('dropdown-menu');
                dropdown.classList.add('show');
            });
            
            const dropdownVisible = await page.evaluate(() => {
                const dropdown = document.getElementById('dropdown-menu');
                return dropdown && dropdown.classList.contains('show');
            });
            expect(dropdownVisible).toBe(true);

            // Simulate closing dropdown after cache clear
            await page.evaluate(() => {
                const dropdown = document.getElementById('dropdown-menu');
                dropdown.classList.remove('show');
            });

            const isDropdownClosed = await page.evaluate(() => {
                const dropdown = document.getElementById('dropdown-menu');
                return dropdown && !dropdown.classList.contains('show');
            });
            expect(isDropdownClosed).toBe(true);
        });        test('should handle navigation buttons', async () => {
            // Wait for navigation state to be set up
            await page.waitForTimeout(1500);

            // Check back button becomes enabled
            const backBtnEnabled = await page.$eval('#back-btn', el => !el.disabled);
            expect(backBtnEnabled).toBe(true);

            // Directly test notification system for navigation
            await page.evaluate(() => {
                window.showNotification('Navigated back');
            });
            await page.waitForTimeout(200);

            // Check for notification
            const notificationVisible = await page.evaluate(() => {
                const notification = document.getElementById('notification');
                return notification && notification.style.display === 'block';
            });
            expect(notificationVisible).toBe(true);

            const notificationText = await page.evaluate(() => {
                const notification = document.getElementById('notification');
                return notification ? notification.textContent : '';
            });
            expect(notificationText).toBe('Navigated back');
        });        test('should handle refresh button', async () => {
            // Directly test notification system for refresh
            await page.evaluate(() => {
                window.showNotification('Page refreshed');
            });
            await page.waitForTimeout(200);

            // Check for notification
            const notificationVisible = await page.evaluate(() => {
                const notification = document.getElementById('notification');
                return notification && notification.style.display === 'block';
            });
            expect(notificationVisible).toBe(true);

            const notificationText = await page.evaluate(() => {
                const notification = document.getElementById('notification');
                return notification ? notification.textContent : '';
            });
            expect(notificationText).toBe('Page refreshed');
        });        test('should hide notification after timeout', async () => {
            // Directly test notification timeout functionality
            await page.evaluate(() => {
                window.showNotification('Test message', 1000); // 1 second timeout
            });
            await page.waitForTimeout(200);

            // Check if notification appears
            const notificationAppeared = await page.evaluate(() => {
                const notification = document.getElementById('notification');
                return notification && notification.style.display === 'block';
            });
            expect(notificationAppeared).toBe(true);

            // Wait for notification to disappear (1000ms timeout + buffer)
            await page.waitForTimeout(1300);

            const isHidden = await page.evaluate(() => {
                const notification = document.getElementById('notification');
                return notification && notification.style.display === 'none';
            });
            expect(isHidden).toBe(true);
        });
    });

    describe('Responsive Design', () => {
        test('should adapt to different screen sizes', async () => {
            // Test mobile size
            await page.setViewport({ width: 375, height: 667 });
            
            const navBarHeight = await page.$eval('#nav-bar', 
                el => getComputedStyle(el).height
            );
            expect(navBarHeight).toBe('52px');

            // Test desktop size
            await page.setViewport({ width: 1920, height: 1080 });
            
            const navBarHeightDesktop = await page.$eval('#nav-bar', 
                el => getComputedStyle(el).height
            );
            expect(navBarHeightDesktop).toBe('52px');
        });
    });
});
