const { expect } = require('chai');
const TodoTestHelper = require('../helpers/TodoTestHelper');

describe('Todo Application - Integration and End-to-End Tests', function() {
    let helper;

    beforeEach(async function() {
        helper = new TodoTestHelper();
        await helper.setup();
    });

    afterEach(async function() {
        await helper.teardown();
    });

    it('E2E Test: Complete todo workflow from creation to deletion', async function() {
        await helper.navigateToApp();
        
        // Step 1: Add a new todo
        const taskText = 'Complete E2E workflow test';
        await helper.addTodo(taskText);
        
        let todos = await helper.getTodos();
        expect(todos.some(todo => todo.text.includes(taskText))).to.be.true;
        
        // Step 2: Edit the todo
        const updatedText = 'Updated E2E workflow test';
        await helper.editTodo(0, updatedText);
        
        todos = await helper.getTodos();
        expect(todos.some(todo => todo.text.includes(updatedText))).to.be.true;
        
        // Step 3: Mark as completed
        await helper.toggleTodo(0);
        
        // Step 4: Mark as incomplete again
        await helper.toggleTodo(0);
        
        // Step 5: Delete the todo
        const initialCount = todos.length;
        await helper.deleteTodo(0);
        
        todos = await helper.getTodos();
        expect(todos.length).to.equal(initialCount - 1);
        
        console.log('Complete E2E workflow test passed successfully');
    });

    it('Integration Test: Frontend-Backend communication verification', async function() {
        await helper.navigateToApp();
        
        // Test that frontend can communicate with backend
        const taskText = 'Backend integration test';
        await helper.addTodo(taskText);
        
        // Verify the task appears (indicates successful backend communication)
        const todos = await helper.getTodos();
        expect(todos.some(todo => todo.text.includes(taskText))).to.be.true;
        
        // Test backend health endpoint
        const isHealthy = await helper.checkHealth();
        expect(isHealthy).to.be.true;
        
        console.log('Frontend-Backend integration test passed successfully');
    });
});
