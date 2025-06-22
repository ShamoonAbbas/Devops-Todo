#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

class TestRunner {
    constructor() {
        this.testDir = path.join(__dirname, 'test');
        this.timeout = 30000;
    }

    async runTests(pattern = '*.test.js') {
        console.log('🚀 Starting Todo Application Test Suite...\n');
        
        const mochaArgs = [
            path.join(this.testDir, pattern),
            '--timeout', this.timeout.toString(),
            '--reporter', 'spec',
            '--recursive'
        ];

        const mocha = spawn('npx', ['mocha', ...mochaArgs], {
            stdio: 'inherit',
            shell: true
        });

        return new Promise((resolve, reject) => {
            mocha.on('close', (code) => {
                if (code === 0) {
                    console.log('\n✅ All tests completed successfully!');
                    resolve(code);
                } else {
                    console.log(`\n❌ Tests failed with exit code ${code}`);
                    reject(new Error(`Tests failed with exit code ${code}`));
                }
            });

            mocha.on('error', (error) => {
                console.error('❌ Error running tests:', error);
                reject(error);
            });
        });
    }

    async runSingleTest(testFile) {
        console.log(`🚀 Running single test: ${testFile}\n`);
        
        const mochaArgs = [
            path.join(this.testDir, testFile),
            '--timeout', this.timeout.toString(),
            '--reporter', 'spec'
        ];

        const mocha = spawn('npx', ['mocha', ...mochaArgs], {
            stdio: 'inherit',
            shell: true
        });

        return new Promise((resolve, reject) => {
            mocha.on('close', (code) => {
                if (code === 0) {
                    console.log('\n✅ Test completed successfully!');
                    resolve(code);
                } else {
                    console.log(`\n❌ Test failed with exit code ${code}`);
                    reject(new Error(`Test failed with exit code ${code}`));
                }
            });

            mocha.on('error', (error) => {
                console.error('❌ Error running test:', error);
                reject(error);
            });
        });
    }

    printUsage() {
        console.log(`
Todo Application Test Runner

Usage:
  node run-tests.js [options] [test-file]

Options:
  --help, -h     Show this help message
  --all          Run all tests (default)
  --single       Run a single test file

Examples:
  node run-tests.js                                    # Run all tests
  node run-tests.js --single 01-basic-functionality.test.js   # Run single test
  node run-tests.js --help                             # Show help

Available test files:
  01-basic-functionality.test.js    - Basic app functionality
  02-crud-operations.test.js        - CRUD operations
  03-edit-update.test.js           - Edit and update features
  04-input-validation.test.js      - Input validation
  05-ui-ux.test.js                 - UI/UX testing
  06-performance.test.js           - Performance testing
  07-backend-health.test.js        - Backend health checks
  08-responsive.test.js            - Responsive design
  09-edge-cases.test.js            - Edge cases and error handling
  10-integration-e2e.test.js       - Integration and E2E tests
        `);
    }
}

async function main() {
    const runner = new TestRunner();
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        runner.printUsage();
        return;
    }

    try {
        if (args.includes('--single') && args.length > 1) {
            const testFile = args[args.indexOf('--single') + 1];
            await runner.runSingleTest(testFile);
        } else {
            await runner.runTests();
        }
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = TestRunner;
