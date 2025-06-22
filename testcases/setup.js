#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestSetup {
    constructor() {
        this.rootDir = __dirname;
    }

    log(message) {
        console.log(`[SETUP] ${message}`);
    }

    error(message) {
        console.error(`[ERROR] ${message}`);
    }

    success(message) {
        console.log(`[SUCCESS] ✅ ${message}`);
    }

    async checkNodeVersion() {
        this.log('Checking Node.js version...');
        try {
            const version = execSync('node --version', { encoding: 'utf8' }).trim();
            const majorVersion = parseInt(version.slice(1).split('.')[0]);
            
            if (majorVersion < 14) {
                throw new Error(`Node.js version ${version} is not supported. Please use Node.js 14 or higher.`);
            }
            
            this.success(`Node.js version ${version} is compatible`);
        } catch (error) {
            this.error(`Node.js check failed: ${error.message}`);
            throw error;
        }
    }

    async checkNpmVersion() {
        this.log('Checking npm version...');
        try {
            const version = execSync('npm --version', { encoding: 'utf8' }).trim();
            this.success(`npm version ${version} is available`);
        } catch (error) {
            this.error(`npm check failed: ${error.message}`);
            throw error;
        }
    }

    async installDependencies() {
        this.log('Installing test dependencies...');
        try {
            execSync('npm install', { 
                stdio: 'inherit', 
                cwd: this.rootDir 
            });
            this.success('Dependencies installed successfully');
        } catch (error) {
            this.error(`Dependency installation failed: ${error.message}`);
            throw error;
        }
    }

    async createDirectories() {
        this.log('Creating necessary directories...');
        
        const directories = [
            'screenshots',
            'test-results',
            'logs'
        ];

        for (const dir of directories) {
            const dirPath = path.join(this.rootDir, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                this.log(`Created directory: ${dir}`);
            }
        }
        
        this.success('Directories created successfully');
    }

    async checkChrome() {
        this.log('Checking Chrome browser availability...');
        try {
            // Try to get Chrome version
            let chromeCommand;
            if (process.platform === 'win32') {
                chromeCommand = 'reg query "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon" /v version';
            } else if (process.platform === 'darwin') {
                chromeCommand = '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --version';
            } else {
                chromeCommand = 'google-chrome --version || chromium-browser --version';
            }
            
            const result = execSync(chromeCommand, { encoding: 'utf8' });
            this.success('Chrome browser is available');
        } catch (error) {
            this.error('Chrome browser not found. Please install Google Chrome.');
            this.log('Download Chrome from: https://www.google.com/chrome/');
        }
    }

    async verifyTestEnvironment() {
        this.log('Verifying test environment...');
        
        const requiredFiles = [
            'package.json',
            'helpers/TodoTestHelper.js',
            'config/test.config.js'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(this.rootDir, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Required file missing: ${file}`);
            }
        }

        this.success('Test environment verified');
    }

    async displayInstructions() {
        console.log(`
🎉 Test Environment Setup Complete!

Next Steps:
1. Make sure your Todo application is running:
   ${process.platform === 'win32' ? 'docker-compose.exe up -d' : 'docker-compose up -d'}

2. Verify the application is accessible:
   - Frontend: http://localhost:3100
   - Backend:  http://localhost:5100

3. Run the tests:
   npm test                           # Run all tests
   npm run test:single <test-file>    # Run specific test
   node run-tests.js --help          # See all options

4. Available test files:
   - 01-basic-functionality.test.js
   - 02-crud-operations.test.js
   - 03-edit-update.test.js
   - 04-input-validation.test.js
   - 05-ui-ux.test.js
   - 06-performance.test.js
   - 07-backend-health.test.js
   - 08-responsive.test.js
   - 09-edge-cases.test.js
   - 10-integration-e2e.test.js

Happy Testing! 🚀
        `);
    }

    async setup() {
        try {
            this.log('Starting test environment setup...');
            
            await this.checkNodeVersion();
            await this.checkNpmVersion();
            await this.installDependencies();
            await this.createDirectories();
            await this.checkChrome();
            await this.verifyTestEnvironment();
            
            this.success('Test environment setup completed successfully!');
            await this.displayInstructions();
            
        } catch (error) {
            this.error(`Setup failed: ${error.message}`);
            process.exit(1);
        }
    }
}

async function main() {
    const setup = new TestSetup();
    await setup.setup();
}

if (require.main === module) {
    main();
}

module.exports = TestSetup;
