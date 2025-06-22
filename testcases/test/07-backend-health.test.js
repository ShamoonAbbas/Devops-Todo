const { expect } = require('chai');
const TodoTestHelper = require('../helpers/TodoTestHelper');

describe('Todo Application - Backend Health and API Tests', function() {
    let helper;

    beforeEach(async function() {
        helper = new TodoTestHelper();
        await helper.setup();
    });

    afterEach(async function() {
        await helper.teardown();
    });

    it('Backend Health Test: Should verify backend health endpoint', async function() {
        const isHealthy = await helper.checkHealth();
        expect(isHealthy).to.be.true;
    });
});
