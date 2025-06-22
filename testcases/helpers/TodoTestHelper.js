const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class TodoTestHelper {
    constructor() {
        this.driver = null;
        this.baseUrl = 'http://localhost:3100'; // Frontend URL
        this.apiUrl = 'http://localhost:5100';  // Backend URL
    }

    async setup() {
        const chromeOptions = new chrome.Options();
        chromeOptions.addArguments('--headless');
        chromeOptions.addArguments('--no-sandbox');
        chromeOptions.addArguments('--disable-dev-shm-usage');
        chromeOptions.addArguments('--disable-gpu');
        chromeOptions.addArguments('--window-size=1920,1080');

        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .build();

        await this.driver.manage().setTimeouts({ implicit: 10000 });
    }

    async teardown() {
        if (this.driver) {
            await this.driver.quit();
        }
    }

    async navigateToApp() {
        await this.driver.get(this.baseUrl);
        await this.driver.wait(until.titleContains('React App'), 10000);
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
