const { expect } = require('chai');
const TodoTestHelper = require('../helpers/TodoTestHelper');
//shamoon

describe('Todo Application - Basic Functionality Tests', function() {
    let helper;

    beforeEach(async function() {
        helper = new TodoTestHelper();
        await helper.setup();
    });

    afterEach(async function() {
        await helper.teardown();
    });

    it('Test Case 1: Should load the todo application successfully', async function() {
        await helper.navigateToApp();
        
        const title = await helper.driver.getTitle();
        expect(title).to.include('React App');
        
        // Check if the main components are present
        const heading = await helper.driver.findElement(helper.driver.By.css('h1'));
        const headingText = await heading.getText();
        expect(headingText).to.equal('Todo List');
        
        const inputField = await helper.driver.findElement(helper.driver.By.css('input[placeholder="Enter a task"]'));
        expect(inputField).to.not.be.null;
        
        const addButton = await helper.driver.findElement(helper.driver.By.css('button'));
        const buttonText = await addButton.getText();
        expect(buttonText).to.equal('ADD');
    });

    it('Test Case 2: Should add a new todo item successfully', async function() {
        await helper.navigateToApp();
        
        const taskText = 'Test Task 1';
        await helper.addTodo(taskText);
        
        const todos = await helper.getTodos();
        expect(todos.length).to.be.greaterThan(0);
        expect(todos.some(todo => todo.text.includes(taskText))).to.be.true;
    });
});
