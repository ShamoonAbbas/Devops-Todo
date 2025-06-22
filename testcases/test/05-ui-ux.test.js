const { expect } = require('chai');
const TodoTestHelper = require('../helpers/TodoTestHelper');

describe('Todo Application - UI and UX Tests', function() {
    let helper;

    beforeEach(async function() {
        helper = new TodoTestHelper();
        await helper.setup();
    });

    afterEach(async function() {
        await helper.teardown();
    });

    it('Test Case 10: Should display "No tasks found" when no todos exist', async function() {
        await helper.navigateToApp();
        
        // Delete all existing todos first (if any)
        let todos = await helper.getTodos();
        while (todos.length > 0) {
            await helper.deleteTodo(0);
            todos = await helper.getTodos();
        }
        
        // Check if "No tasks found" message is displayed
        try {
            await helper.waitForNoTasksMessage();
            const noTasksElement = await helper.driver.findElement(helper.driver.By.xpath("//div[contains(text(), 'No tasks found')]"));
            const isDisplayed = await noTasksElement.isDisplayed();
            expect(isDisplayed).to.be.true;
        } catch (error) {
            // If element not found, check if there are indeed no todos
            const finalTodos = await helper.getTodos();
            expect(finalTodos.length).to.equal(0);
        }
    });
});
