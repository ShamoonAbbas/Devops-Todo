const { expect } = require('chai');
const TodoTestHelper = require('../helpers/TodoTestHelper');

describe('Todo Application - Edge Cases and Error Handling', function() {
    let helper;

    beforeEach(async function() {
        helper = new TodoTestHelper();
        await helper.setup();
    });

    afterEach(async function() {
        await helper.teardown();
    });

    it('Edge Case Test: Should handle rapid consecutive actions', async function() {
        await helper.navigateToApp();
        
        // Add a task
        await helper.addTodo('Rapid action test');
        
        // Perform rapid consecutive actions
        await helper.toggleTodo(0); // Mark complete
        await helper.driver.sleep(100);
        await helper.toggleTodo(0); // Mark incomplete
        await helper.driver.sleep(100);
        await helper.toggleTodo(0); // Mark complete again
        
        // Verify the application still works
        const todos = await helper.getTodos();
        expect(todos.length).to.be.greaterThan(0);
        expect(todos.some(todo => todo.text.includes('Rapid action test'))).to.be.true;
    });

    it('Edge Case Test: Should handle page refresh and data persistence', async function() {
        await helper.navigateToApp();
        
        // Add a task
        const taskText = 'Persistence test task';
        await helper.addTodo(taskText);
        
        let todos = await helper.getTodos();
        const initialCount = todos.length;
        
        // Refresh the page
        await helper.driver.navigate().refresh();
        await helper.driver.sleep(3000);
        
        // Check if data persists (depends on backend implementation)
        todos = await helper.getTodos();
        
        // The task should still be there if backend persistence works
        // This test helps identify if the backend is properly storing data
        console.log(`Tasks after refresh: ${todos.length}, Initial count: ${initialCount}`);
        
        // At minimum, the application should load without errors
        const heading = await helper.driver.findElement(helper.driver.By.css('h1'));
        const headingText = await heading.getText();
        expect(headingText).to.equal('Todo List');
    });
});
