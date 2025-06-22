# Todo Application Test Suite

This test suite contains comprehensive automated tests for the Todo application using Node.js and headless Selenium WebDriver.

## Test Structure

The test suite includes 10 comprehensive test cases covering:

1. **Basic Functionality Tests** (`01-basic-functionality.test.js`)
   - Application loading verification
   - UI component presence validation

2. **CRUD Operations Tests** (`02-crud-operations.test.js`)
   - Adding new todos
   - Deleting todos
   - Marking todos as complete/incomplete

3. **Edit and Update Tests** (`03-edit-update.test.js`)
   - Editing todo text
   - Handling multiple todos

4. **Input Validation Tests** (`04-input-validation.test.js`)
   - Empty input handling
   - Special characters validation
   - Long text handling

5. **UI and UX Tests** (`05-ui-ux.test.js`)
   - "No tasks found" message display
   - User interface behavior

6. **Performance Tests** (`06-performance.test.js`)
   - Multiple todo addition performance
   - Load testing scenarios

7. **Backend Health Tests** (`07-backend-health.test.js`)
   - API health endpoint verification
   - Backend connectivity testing

8. **Responsive Design Tests** (`08-responsive.test.js`)
   - Mobile screen size testing
   - Tablet compatibility
   - Cross-device functionality

9. **Edge Cases and Error Handling** (`09-edge-cases.test.js`)
   - Rapid consecutive actions
   - Page refresh and data persistence
   - Error recovery scenarios

10. **Integration and E2E Tests** (`10-integration-e2e.test.js`)
    - Complete workflow testing
    - Frontend-backend communication
    - End-to-end user scenarios

## Prerequisites

Before running the tests, ensure you have:

1. **Node.js** (version 14 or higher)
2. **Chrome browser** installed
3. **Todo application** running locally:
   - Frontend on `http://localhost:3000`
   - Backend on `http://localhost:5000`

## Installation

1. Navigate to the testcases directory:
   ```bash
   cd testcases
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm run test:single test/01-basic-functionality.test.js
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Detailed Output
```bash
npx mocha test/*.js --timeout 30000 --reporter spec
```

## Test Configuration

### Browser Configuration
Tests run in headless Chrome by default with the following options:
- `--headless`: Runs without GUI
- `--no-sandbox`: Required for some CI environments
- `--disable-dev-shm-usage`: Prevents memory issues
- `--disable-gpu`: Disables GPU acceleration
- `--window-size=1920,1080`: Sets default window size

### Timeouts
- Default test timeout: 30 seconds
- Implicit wait: 10 seconds
- Custom waits: Varies by operation

## Application URLs

Make sure your application is running on:
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:5000`

To start the application using Docker Compose:
```bash
docker-compose up -d
```

## Test Reports

Tests use Mocha's default reporter. For enhanced reporting, you can install and use mochawesome:

```bash
npm install mochawesome --save-dev
npx mocha test/*.js --timeout 30000 --reporter mochawesome
```

## Troubleshooting

### Common Issues

1. **Chrome Driver Issues**
   - Ensure Chrome browser is installed
   - Update chromedriver: `npm update chromedriver`

2. **Application Not Running**
   - Verify frontend is accessible at `http://localhost:3000`
   - Verify backend is accessible at `http://localhost:5000`
   - Check Docker containers are running: `docker ps`

3. **Test Timeouts**
   - Increase timeout values if needed
   - Check network connectivity
   - Verify application response times

4. **Selenium WebDriver Issues**
   - Update selenium-webdriver: `npm update selenium-webdriver`
   - Check Chrome version compatibility

### Debug Mode

To run tests with debug information:
```bash
DEBUG=* npm test
```

## Contributing

When adding new tests:
1. Follow the existing naming convention
2. Include appropriate assertions
3. Add cleanup in `afterEach` hooks
4. Document test purpose clearly
5. Handle async operations properly

## Test Best Practices

1. **Independent Tests**: Each test should be independent and not rely on others
2. **Clean State**: Use `beforeEach` and `afterEach` for setup/cleanup
3. **Meaningful Assertions**: Use descriptive expect statements
4. **Error Handling**: Include try-catch blocks where appropriate
5. **Timeouts**: Set appropriate timeouts for operations
6. **Documentation**: Comment complex test logic

## CI/CD Integration

These tests can be integrated into CI/CD pipelines. Ensure:
1. Chrome/Chromium is available in the CI environment
2. Application is deployed and accessible
3. Appropriate timeout values for CI environment
4. Test reports are generated and stored

Example Jenkins integration:
```groovy
stage('Run Selenium Tests') {
    steps {
        dir('testcases') {
            sh 'npm install'
            sh 'npm test'
        }
    }
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'mochawesome-report',
                reportFiles: 'mochawesome.html',
                reportName: 'Test Report'
            ])
        }
    }
}
```
