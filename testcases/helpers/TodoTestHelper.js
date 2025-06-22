const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class TodoTestHelper {
    constructor() {
        this.driver = null;
        this.baseUrl = this.getEnvironmentUrl('FRONTEND_URL', 'http://localhost:3000');
        this.apiUrl = this.getEnvironmentUrl('BACKEND_URL', 'http://localhost:5000');
        this.useRemoteWebDriver = process.env.USE_SELENIUM_GRID === 'true';
        this.seleniumHubUrl = process.env.SELENIUM_HUB_URL || 'http://selenium-hub:4444/wd/hub';
    }

    getEnvironmentUrl(envVar, defaultUrl) {
        const envUrl = process.env[envVar];
        if (envUrl) return envUrl;
        
        // If running in Docker, use host.docker.internal
        if (process.env.NODE_ENV === 'test' && process.env.DOCKER_ENV === 'true') {
            return defaultUrl.replace('localhost', 'host.docker.internal');
        }
        
        return defaultUrl;
    }    async setup() {
        try {
            console.log('Starting WebDriver setup...');
            const chromeOptions = new chrome.Options();
            
            // Common Chrome options
            chromeOptions.addArguments('--headless');
            chromeOptions.addArguments('--no-sandbox');
            chromeOptions.addArguments('--disable-dev-shm-usage');
            chromeOptions.addArguments('--disable-gpu');
            chromeOptions.addArguments('--window-size=1920,1080');
            chromeOptions.addArguments('--disable-extensions');
            chromeOptions.addArguments('--disable-web-security');
            chromeOptions.addArguments('--disable-features=VizDisplayCompositor');
            chromeOptions.addArguments('--remote-debugging-port=9222');
            
            // Additional options for Docker environment
            if (process.env.NODE_ENV === 'test') {
                chromeOptions.addArguments('--disable-background-timer-throttling');
                chromeOptions.addArguments('--disable-backgrounding-occluded-windows');
                chromeOptions.addArguments('--disable-renderer-backgrounding');
                chromeOptions.addArguments('--disable-ipc-flooding-protection');
                chromeOptions.addArguments('--memory-pressure-off');
            }

            let builder = new Builder().forBrowser('chrome');

            if (this.useRemoteWebDriver) {
                // Use Selenium Grid
                builder = builder.usingServer(this.seleniumHubUrl);
                console.log(`Using Selenium Grid at: ${this.seleniumHubUrl}`);
            } else {
                // Use local Chrome
                console.log('Using local Chrome with options:', chromeOptions.getArguments());
                builder = builder.setChromeOptions(chromeOptions);
            }

            console.log('Building WebDriver...');
            this.driver = await builder.build();
            console.log('WebDriver built successfully');
            
            await this.driver.manage().setTimeouts({ 
                implicit: 10000,
                pageLoad: 30000,
                script: 30000 
            });
            console.log('WebDriver setup completed');
        } catch (error) {
            console.error('Error during WebDriver setup:', error.message);
            throw error;
        }
    }async teardown() {
        if (this.driver) {
            try {
                await this.driver.quit();
            } catch (error) {
                console.error('Error during driver teardown:', error.message);
            }
        }
    }

    async navigateToApp() {
        try {
            console.log(`Navigating to: ${this.baseUrl}`);
            await this.driver.get(this.baseUrl);
            await this.driver.wait(until.titleContains('React App'), 15000);
        } catch (error) {
            console.error(`Failed to navigate to app: ${error.message}`);
            throw error;
        }
    }

    async takeScreenshot(filename) {
        try {
            const screenshot = await this.driver.takeScreenshot();
            const fs = require('fs');
            const path = require('path');
            
            const screenshotDir = path.join(__dirname, '..', 'screenshots');
            if (!fs.existsSync(screenshotDir)) {
                fs.mkdirSync(screenshotDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotPath = path.join(screenshotDir, `${filename || 'screenshot'}-${timestamp}.png`);
            
            fs.writeFileSync(screenshotPath, screenshot, 'base64');
            console.log(`Screenshot saved: ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            console.error('Failed to take screenshot:', error.message);
        }
    }

    async addTodo(taskText) {
        const inputField = await this.driver.wait(
            until.elementLocated(By.css('input[placeholder="Enter a task"]')), 
            10000
        );
        await inputField.clear();
        await inputField.sendKeys(taskText);
        
        const addButton = await this.driver.findElement(By.css('button'));
        await addButton.click();
        
        // Wait for page reload or task to appear
        await this.driver.sleep(2000);
    }

    async getTodos() {
        try {
            const todoElements = await this.driver.findElements(By.css('.task'));
            const todos = [];
            
            for (let element of todoElements) {
                const text = await element.getText();
                const isCompleted = await element.findElements(By.css('.icon')).then(icons => 
                    icons.length > 0 ? element.findElement(By.css('.icon')).getAttribute('class').then(cls => cls.includes('BsFillCheckCircleFill')) : false
                );
                todos.push({ text, isCompleted });
            }
            
            return todos;
        } catch (error) {
            return [];
        }
    }

    async deleteTodo(todoIndex = 0) {
        const todoElements = await this.driver.findElements(By.css('.task'));
        if (todoElements.length > todoIndex) {
            const deleteButton = await todoElements[todoIndex].findElement(By.css('svg[data-icon="trash-fill"], .icon:last-child'));
            await deleteButton.click();
            await this.driver.sleep(2000);
        }
    }

    async toggleTodo(todoIndex = 0) {
        const todoElements = await this.driver.findElements(By.css('.task'));
        if (todoElements.length > todoIndex) {
            const checkboxIcon = await todoElements[todoIndex].findElement(By.css('.checkbox .icon'));
            await checkboxIcon.click();
            await this.driver.sleep(2000);
        }
    }

    async editTodo(todoIndex = 0, newText = '') {
        const todoElements = await this.driver.findElements(By.css('.task'));
        if (todoElements.length > todoIndex) {
            const editButton = await todoElements[todoIndex].findElement(By.css('svg[data-icon="pencil"], .icon:nth-last-child(2)'));
            await editButton.click();
            await this.driver.sleep(1000);
            
            const inputField = await todoElements[todoIndex].findElement(By.css('input[type="text"]'));
            await inputField.clear();
            await inputField.sendKeys(newText);
            
            // Click edit button again to save
            await editButton.click();
            await this.driver.sleep(2000);
        }
    }

    async waitForNoTasksMessage() {
        return await this.driver.wait(
            until.elementLocated(By.xpath("//div[contains(text(), 'No tasks found')]")), 
            10000
        );
    }

    async checkHealth() {
        try {
            await this.driver.get(this.apiUrl + '/health');
            const body = await this.driver.findElement(By.tagName('body')).getText();
            return body.includes('OK');
        } catch (error) {
            return false;
        }
    }
}

module.exports = TodoTestHelper;
