const { expect } = require('chai');
const TodoTestHelper = require('../helpers/TodoTestHelper');

describe('Todo Application - Edit and Update Tests', function() {
    let helper;

    beforeEach(async function() {
        helper = new TodoTestHelper();
        await helper.setup();
    });

    afterEach(async function() {
        await helper.teardown();
    });

    it('Test Case 5: Should edit a todo item successfully', async function() {
        await helper.navigateToApp();
        
        // Add a task first
        const originalText = 'Original task text';
        await helper.addTodo(originalText);
        
        // Edit the task
        const newText = 'Updated task text';
        await helper.editTodo(0, newText);
        
        const todos = await helper.getTodos();
        expect(todos.some(todo => todo.text.includes(newText))).to.be.true;
        expect(todos.some(todo => todo.text.includes(originalText))).to.be.false;
    });

    it('Test Case 6: Should handle multiple todo items correctly', async function() {
        await helper.navigateToApp();
        
        // Add multiple tasks
        const tasks = ['Task 1', 'Task 2', 'Task 3'];
        
        for (const task of tasks) {
            await helper.addTodo(task);
        }
        
        const todos = await helper.getTodos();
        expect(todos.length).to.be.at.least(tasks.length);
        
        // Verify all tasks are present
        for (const task of tasks) {
            expect(todos.some(todo => todo.text.includes(task))).to.be.true;
        }
    });
});
