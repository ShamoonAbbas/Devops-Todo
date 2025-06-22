const { expect } = require('chai');
const TodoTestHelper = require('../helpers/TodoTestHelper');

describe('Todo Application - Performance and Load Tests', function() {
    let helper;

    beforeEach(async function() {
        helper = new TodoTestHelper();
        await helper.setup();
    });

    afterEach(async function() {
        await helper.teardown();
    });

    it('Performance Test: Should handle adding multiple todos quickly', async function() {
        await helper.navigateToApp();
        
        const startTime = Date.now();
        const numberOfTasks = 10;
        
        // Add multiple tasks
        for (let i = 1; i <= numberOfTasks; i++) {
            await helper.addTodo(`Performance Test Task ${i}`);
        }
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        console.log(`Time taken to add ${numberOfTasks} tasks: ${totalTime}ms`);
        
        // Verify all tasks were added
        const todos = await helper.getTodos();
        expect(todos.length).to.be.at.least(numberOfTasks);
        
        // Performance should complete within reasonable time (30 seconds for 10 tasks)
        expect(totalTime).to.be.below(30000);
    });
});
