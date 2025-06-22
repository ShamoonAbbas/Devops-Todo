module.exports = {
    // Environment configurations
    environments: {
        local: {
            frontendUrl: 'http://localhost:3100',
            backendUrl: 'http://localhost:5100'
        },
        docker: {
            frontendUrl: 'http://localhost:3100',
            backendUrl: 'http://localhost:5100'
        },
        staging: {
            frontendUrl: 'http://staging.todo-app.com',
            backendUrl: 'http://staging-api.todo-app.com'
        },
        production: {
            frontendUrl: 'http://todo-app.com',
            backendUrl: 'http://api.todo-app.com'
        }
    },

    // Browser configurations
    browser: {
        chrome: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--disable-extensions',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        }
    },

    // Timeout configurations
    timeouts: {
        implicit: 10000,
        pageLoad: 30000,
        script: 30000,
        testCase: 30000
    },

    // Test data
    testData: {
        sampleTasks: [
            'Buy groceries',
            'Complete project documentation',
            'Call client for meeting',
            'Review code changes',
            'Update system dependencies'
        ],
        specialCharTasks: [
            'Task with special chars: !@#$%^&*()',
            'Unicode task: 🚀 Launch rocket',
            'HTML tags: <script>alert("test")</script>',
            'SQL injection: \'; DROP TABLE todos; --'
        ]
    },

    // Selectors (CSS/XPath)
    selectors: {
        todoInput: 'input[placeholder="Enter a task"]',
        addButton: 'button',
        todoItems: '.task',
        deleteButton: '.icon:last-child',
        editButton: '.icon:nth-last-child(2)',
        checkboxIcon: '.checkbox .icon',
        noTasksMessage: '//div[contains(text(), "No tasks found")]',
        todoText: '.task p',
        editInput: '.task input[type="text"]'
    },

    // Performance thresholds
    performance: {
        pageLoadTime: 5000,
        taskAddTime: 3000,
        taskDeleteTime: 2000,
        maxTasksForPerformanceTest: 20
    }
};

// Get current environment configuration
function getConfig(env = 'local') {
    const config = module.exports;
    return {
        ...config,
        currentEnv: env,
        urls: config.environments[env] || config.environments.local
    };
}

module.exports.getConfig = getConfig;
