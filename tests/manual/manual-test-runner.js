// Manual testing guide and test runner
const readline = require('readline');
const { exec } = require('child_process');
const path = require('path');

class ManualTestRunner {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.tests = [
            {
                name: 'Application Startup',
                description: 'Test basic application startup and window creation',
                steps: [
                    '1. Run "npm start" to launch the application',
                    '2. Verify the application window opens in fullscreen',
                    '3. Verify the application stays on top of other windows',
                    '4. Check that all UI elements are visible (navigation bar, URL bar, webview)'
                ]
            },
            {
                name: 'Navigation Functionality',
                description: 'Test browser navigation features',
                steps: [
                    '1. Test back button (should be disabled initially)',
                    '2. Navigate to a different page',
                    '3. Test back button (should now work)',
                    '4. Test forward button',
                    '5. Test refresh button',
                    '6. Verify URL bar updates correctly'
                ]
            },
            {
                name: 'Tab Management',
                description: 'Test tab creation, switching, and closing',
                steps: [
                    '1. Click the "+" button to create a new tab',
                    '2. Verify new tab appears and becomes active',
                    '3. Switch between tabs by clicking on them',
                    '4. Close a tab using the "×" button',
                    '5. Verify remaining tabs still work',
                    '6. Test maximum tab limit (should be 3)'
                ]
            },
            {
                name: 'Dropdown Menu',
                description: 'Test dropdown menu functionality',
                steps: [
                    '1. Click the menu button (⋮)',
                    '2. Verify dropdown menu appears',
                    '3. Test "Clear all data" button',
                    '4. Test "Settings" button (requires password)',
                    '5. Test "Close" button (requires password)',
                    '6. Click outside to close dropdown'
                ]
            },
            {
                name: 'Cache Clearing',
                description: 'Test comprehensive cache clearing functionality',
                steps: [
                    '1. Navigate to a website with data (login, cookies, etc.)',
                    '2. Open dropdown menu',
                    '3. Click "Clear all data"',
                    '4. Verify notification appears',
                    '5. Verify page reloads',
                    '6. Check that previous data is cleared'
                ]
            },
            {
                name: 'Settings Panel',
                description: 'Test settings functionality',
                steps: [
                    '1. Open dropdown menu',
                    '2. Click "Settings"',
                    '3. Enter password (default: 1234)',
                    '4. Verify settings popup appears',
                    '5. Test theme switching (Light/Dark)',
                    '6. Verify theme changes apply immediately',
                    '7. Close settings and verify theme persists'
                ]
            },
            {
                name: 'Password Protection',
                description: 'Test password protection for sensitive features',
                steps: [
                    '1. Try to access Settings without password',
                    '2. Enter wrong password',
                    '3. Verify error message appears',
                    '4. Enter correct password (1234)',
                    '5. Verify access is granted',
                    '6. Test password protection on Close button'
                ]
            },
            {
                name: 'New Window Handling',
                description: 'Test prevention of unwanted new windows/tabs',
                steps: [
                    '1. Navigate to a website with external links',
                    '2. Click links that normally open in new tabs',
                    '3. Verify they open in current tab instead',
                    '4. Test middle-click on links',
                    '5. Verify middle-click is prevented',
                    '6. Test legitimate popups (should still work)'
                ]
            },
            {
                name: 'Theme System',
                description: 'Test light and dark theme functionality',
                steps: [
                    '1. Start application (should use saved theme)',
                    '2. Switch to light theme in settings',
                    '3. Verify all UI elements use light colors',
                    '4. Switch to dark theme',
                    '5. Verify all UI elements use dark colors',
                    '6. Restart app and verify theme persists'
                ]
            },
            {
                name: 'Notification System',
                description: 'Test notification display and timing',
                steps: [
                    '1. Trigger cache clearing to show notification',
                    '2. Verify notification appears at top center',
                    '3. Verify notification disappears after timeout',
                    '4. Trigger multiple notifications quickly',
                    '5. Verify they update content properly'
                ]
            },
            {
                name: 'Webview Integration',
                description: 'Test webview functionality and restrictions',
                steps: [
                    '1. Navigate to different websites',
                    '2. Test JavaScript functionality on websites',
                    '3. Test form submissions',
                    '4. Test file downloads',
                    '5. Verify security restrictions are in place',
                    '6. Test webview reloading after cache clear'
                ]
            },
            {
                name: 'Error Handling',
                description: 'Test application resilience to errors',
                steps: [
                    '1. Navigate to non-existent website',
                    '2. Test navigation with no internet connection',
                    '3. Try to clear cache when offline',
                    '4. Test rapid clicking of buttons',
                    '5. Verify app remains stable'
                ]
            }
        ];
    }

    async runTest(testIndex) {
        const test = this.tests[testIndex];
        if (!test) {
            console.log('❌ Invalid test index');
            return;
        }

        console.log(`\n🧪 Testing: ${test.name}`);
        console.log(`📝 Description: ${test.description}\n`);

        for (const step of test.steps) {
            console.log(`   ${step}`);
        }

        console.log('\n📋 After completing all steps, did the test pass?');
        const result = await this.askQuestion('[y/N]: ');
        
        if (result.toLowerCase() === 'y' || result.toLowerCase() === 'yes') {
            console.log('✅ Test PASSED');
            return true;
        } else {
            console.log('❌ Test FAILED');
            const reason = await this.askQuestion('Please describe what went wrong: ');
            console.log(`📝 Failure reason: ${reason}`);
            return false;
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Manual Test Suite for Browser App\n');
        console.log('This will guide you through testing all application features manually.\n');

        const results = [];

        for (let i = 0; i < this.tests.length; i++) {
            const passed = await this.runTest(i);
            results.push({ test: this.tests[i].name, passed });

            if (i < this.tests.length - 1) {
                console.log('\n⏳ Press Enter to continue to next test...');
                await this.askQuestion('');
            }
        }

        this.showResults(results);
    }

    async runSpecificTest() {
        console.log('\n📝 Available Tests:');
        this.tests.forEach((test, index) => {
            console.log(`   ${index + 1}. ${test.name}`);
        });

        const choice = await this.askQuestion('\nEnter test number to run: ');
        const testIndex = parseInt(choice) - 1;

        if (testIndex >= 0 && testIndex < this.tests.length) {
            await this.runTest(testIndex);
        } else {
            console.log('❌ Invalid test number');
        }
    }

    showResults(results) {
        console.log('\n📊 Manual Test Results Summary:');
        console.log('===============================');

        const passed = results.filter(r => r.passed).length;
        const total = results.length;

        results.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`   ${status} ${result.test}`);
        });

        console.log(`\n📈 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);

        if (passed === total) {
            console.log('🎉 All manual tests passed! Your application is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Please review the failed tests and fix any issues.');
        }
    }

    async askQuestion(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    async startApp() {
        console.log('🚀 Starting Browser App...');
        return new Promise((resolve, reject) => {
            const process = exec('npm start', { cwd: path.join(__dirname, '../..') });
            
            setTimeout(() => {
                console.log('✅ App should be running now');
                resolve(process);
            }, 3000);

            process.on('error', reject);
        });
    }

    async main() {
        console.log('🔧 Browser App Manual Test Runner');
        console.log('==================================\n');

        const choice = await this.askQuestion(
            'Choose an option:\n' +
            '1. Run all tests\n' +
            '2. Run specific test\n' +
            '3. Start app only\n' +
            'Enter choice (1-3): '
        );

        switch (choice) {
            case '1':
                await this.startApp();
                await this.runAllTests();
                break;
            case '2':
                await this.startApp();
                await this.runSpecificTest();
                break;
            case '3':
                await this.startApp();
                console.log('App started. You can now test manually.');
                break;
            default:
                console.log('❌ Invalid choice');
        }

        this.rl.close();
    }
}

// Run the manual test runner
if (require.main === module) {
    const runner = new ManualTestRunner();
    runner.main().catch(console.error);
}

module.exports = ManualTestRunner;
