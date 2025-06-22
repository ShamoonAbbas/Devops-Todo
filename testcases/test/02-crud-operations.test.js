const { expect } = require('chai');
const TodoTestHelper = require('../helpers/TodoTestHelper');

describe('Todo Application - CRUD Operations Tests', function() {
    let helper;

    beforeEach(async function() {
        helper = new TodoTestHelper();
        await helper.setup();
    });

    afterEach(async function() {
        await helper.teardown();
    });

    it('Test Case 3: Should delete a todo item successfully', async function() {
        await helper.navigateToApp();
        
        // Add a task first
        const taskText = 'Task to be deleted';
        await helper.addTodo(taskText);
        
        let todos = await helper.getTodos();
        const initialCount = todos.length;
        
        // Delete the task
        await helper.deleteTodo(0);
        
        todos = await helper.getTodos();
        expect(todos.length).to.equal(initialCount - 1);
    });

    it('Test Case 4: Should mark a todo item as completed', async function() {
        await helper.navigateToApp();
        
        // Add a task first
        const taskText = 'Task to be completed';
        await helper.addTodo(taskText);
        
        // Mark it as completed
        await helper.toggleTodo(0);
        
        const todos = await helper.getTodos();
        expect(todos.length).to.be.greaterThan(0);
        
        // Check if the task is marked as completed (this may vary based on implementation)
        const completedTasks = todos.filter(todo => todo.isCompleted);
        expect(completedTasks.length).to.be.greaterThan(0);
    });
});
