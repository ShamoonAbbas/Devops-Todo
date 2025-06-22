const { expect } = require('chai');
const TodoTestHelper = require('../helpers/TodoTestHelper');

describe('Todo Application - Cross-browser and Responsive Tests', function() {
    let helper;

    beforeEach(async function() {
        helper = new TodoTestHelper();
        await helper.setup();
    });

    afterEach(async function() {
        await helper.teardown();
    });

    it('Responsive Test: Should work on different screen sizes', async function() {
        await helper.navigateToApp();
        
        // Test mobile size
        await helper.driver.manage().window().setRect({ width: 375, height: 667 });
        await helper.driver.sleep(1000);
        
        // Verify elements are still accessible
        const inputField = await helper.driver.findElement(helper.driver.By.css('input[placeholder="Enter a task"]'));
        const isDisplayed = await inputField.isDisplayed();
        expect(isDisplayed).to.be.true;
        
        // Test tablet size
        await helper.driver.manage().window().setRect({ width: 768, height: 1024 });
        await helper.driver.sleep(1000);
        
        // Test adding a task on smaller screen
        await helper.addTodo('Mobile test task');
        
        const todos = await helper.getTodos();
        expect(todos.some(todo => todo.text.includes('Mobile test task'))).to.be.true;
        
        // Reset to desktop size
        await helper.driver.manage().window().setRect({ width: 1920, height: 1080 });
    });
});
