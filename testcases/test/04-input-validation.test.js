const { expect } = require('chai');
const TodoTestHelper = require('../helpers/TodoTestHelper');

describe('Todo Application - Input Validation Tests', function() {
    let helper;

    beforeEach(async function() {
        helper = new TodoTestHelper();
        await helper.setup();
    });

    afterEach(async function() {
        await helper.teardown();
    });

    it('Test Case 7: Should handle empty input validation', async function() {
        await helper.navigateToApp();
        
        const initialTodos = await helper.getTodos();
        const initialCount = initialTodos.length;
        
        // Try to add empty task
        await helper.addTodo('');
        
        const finalTodos = await helper.getTodos();
        // Should not add empty task
        expect(finalTodos.length).to.equal(initialCount);
    });

    it('Test Case 8: Should handle special characters in todo text', async function() {
        await helper.navigateToApp();
        
        const specialCharTask = 'Task with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
        await helper.addTodo(specialCharTask);
        
        const todos = await helper.getTodos();
        expect(todos.some(todo => todo.text.includes('special chars'))).to.be.true;
    });

    it('Test Case 9: Should handle very long todo text', async function() {
        await helper.navigateToApp();
        
        const longTask = 'A'.repeat(500); // Very long task
        await helper.addTodo(longTask);
        
        const todos = await helper.getTodos();
        expect(todos.some(todo => todo.text.includes('A'))).to.be.true;
    });
});
