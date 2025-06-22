# Docker Test Environment for Todo Application

This directory contains Docker configurations to run the Todo application test suite in containerized environments.

## 📁 Docker Files Overview

- `Dockerfile` - Basic test runner with Chrome
- `Dockerfile.standalone` - Enhanced standalone test runner with security features
- `docker-compose.yml` - Simple test runner setup
- `docker-compose.full.yml` - Complete application stack with tests
- `nginx.conf` - Configuration for test report server
- `run-docker-tests.sh` / `run-docker-tests.bat` - Cross-platform test runner scripts

## 🚀 Quick Start

### 1. Run Tests with Docker Compose (Simple)

```bash
# Build and run tests in Docker
docker-compose up --build test-runner
```

### 2. Run Tests with Full Application Stack

```bash
# Run the complete application with tests
docker-compose -f docker-compose.full.yml --profile test up --build
```

### 3. Run Tests with Selenium Grid

```bash
# Run tests using Selenium Grid for parallel execution
docker-compose -f docker-compose.full.yml --profile grid-test up --build
```

## 🛠️ Available Commands

### Using NPM Scripts

```bash
# Docker commands via npm
npm run docker:build      # Build test image
npm run docker:test       # Run tests in Docker
npm run docker:full       # Run full stack tests
npm run docker:grid       # Run tests with Selenium Grid
npm run docker:reports    # Start test report server
npm run docker:cleanup    # Clean up Docker resources
```

### Using Helper Scripts

#### Linux/macOS (bash)
```bash
# Make script executable
chmod +x run-docker-tests.sh

# Run different test scenarios
./run-docker-tests.sh local     # Run tests locally
./run-docker-tests.sh docker    # Run tests in Docker
./run-docker-tests.sh full      # Run full stack tests
./run-docker-tests.sh grid      # Run tests with Selenium Grid
./run-docker-tests.sh reports   # Start report server
./run-docker-tests.sh cleanup   # Clean up resources
```

#### Windows (batch)
```cmd
# Run different test scenarios
run-docker-tests.bat local     # Run tests locally
run-docker-tests.bat docker    # Run tests in Docker
run-docker-tests.bat full      # Run full stack tests
run-docker-tests.bat grid      # Run tests with Selenium Grid
run-docker-tests.bat reports   # Start report server
run-docker-tests.bat cleanup   # Clean up resources
```

## 🏗️ Docker Configurations

### 1. Basic Test Runner (`docker-compose.yml`)

- **Purpose**: Simple test execution in Docker
- **Services**: 
  - `test-runner`: Executes tests
  - `selenium-hub`: Selenium Grid hub
  - `chrome-node`: Chrome browser node
  - `test-reports`: Nginx server for reports

### 2. Full Stack (`docker-compose.full.yml`)

- **Purpose**: Complete application testing environment
- **Services**:
  - `mongo`: MongoDB database
  - `backend`: Todo API server
  - `frontend`: React application
  - `selenium-hub`: Selenium Grid hub
  - `chrome`: Chrome browser node
  - `test-runner`: Standalone test execution
  - `test-runner-grid`: Grid-based test execution
  - `test-reports`: Report viewing server

## 🔧 Environment Configuration

### Environment Variables

```bash
# Application URLs
FRONTEND_URL=http://localhost:3100    # Frontend application URL
BACKEND_URL=http://localhost:5100     # Backend API URL

# Docker environment
DOCKER_ENV=true                       # Enable Docker-specific settings
NODE_ENV=test                         # Node environment

# Selenium Grid
USE_SELENIUM_GRID=true               # Use Selenium Grid
SELENIUM_HUB_URL=http://selenium-hub:4444/wd/hub

# Test configuration
TEST_TIMEOUT=60000                   # Test timeout in milliseconds
```

### Docker Networks

All services communicate through the `todo-test-network` bridge network, allowing:
- Frontend to communicate with Backend
- Backend to communicate with MongoDB
- Tests to access Frontend and Backend
- Selenium Grid coordination

## 📊 Test Reports

### Viewing Reports

1. **Start report server**:
   ```bash
   docker-compose --profile reports up -d test-reports
   ```

2. **Access reports at**: http://localhost:8080

### Report Structure

```
test-results/           # Test execution reports
├── mochawesome.html   # HTML test report
├── mochawesome.json   # JSON test data
└── *.xml             # JUnit XML reports

screenshots/           # Test screenshots
├── test-name-timestamp.png
└── error-screenshots/
```

## 🔍 Debugging

### View Container Logs

```bash
# View test runner logs
docker-compose logs test-runner

# View application logs
docker-compose -f docker-compose.full.yml logs backend
docker-compose -f docker-compose.full.yml logs frontend

# View Selenium Grid logs
docker-compose -f docker-compose.full.yml logs selenium-hub
docker-compose -f docker-compose.full.yml logs chrome
```

### Interactive Debugging

```bash
# Run test container interactively
docker run -it --rm \
  -v $(pwd):/app/testcases \
  -e NODE_ENV=test \
  --network todo-test-network \
  todo-tests bash

# Execute specific test
docker run --rm \
  -v $(pwd)/test-results:/app/testcases/test-results \
  -e NODE_ENV=test \
  --network todo-test-network \
  todo-tests npm run test:single test/01-basic-functionality.test.js
```

### Health Checks

All services include health checks to ensure proper startup order:

```bash
# Check service health
docker-compose -f docker-compose.full.yml ps

# Manual health check
curl http://localhost:3100  # Frontend
curl http://localhost:5100/health  # Backend
curl http://localhost:4444/status  # Selenium Grid
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3100
   
   # Stop conflicting services
   docker-compose down
   ```

2. **Memory Issues**
   ```bash
   # Increase Docker memory limit
   # Docker Desktop: Settings > Resources > Memory > 4GB+
   
   # Clean up unused resources
   docker system prune -a
   ```

3. **Chrome/Selenium Issues**
   ```bash
   # Update Chrome image
   docker pull selenium/node-chrome:latest
   
   # Check Chrome node logs
   docker-compose logs chrome
   ```

4. **Network Issues**
   ```bash
   # Recreate network
   docker network rm todo-test-network
   docker-compose up -d
   ```

### Performance Optimization

1. **Resource Limits**
   ```yaml
   # Add to docker-compose.yml services
   deploy:
     resources:
       limits:
         memory: 512M
         cpus: '0.5'
   ```

2. **Build Cache**
   ```bash
   # Use BuildKit for faster builds
   export DOCKER_BUILDKIT=1
   docker-compose build --parallel
   ```

## 🔐 Security Considerations

- Tests run with non-root user in containers
- Network isolation between test and production environments
- Secrets should be managed via Docker secrets or environment files
- Regular image updates for security patches

## 📈 CI/CD Integration

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    
    stages {
        stage('Build and Test') {
            steps {
                dir('testcases') {
                    sh 'docker-compose -f docker-compose.full.yml --profile test up --build --abort-on-container-exit'
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'testcases/test-results',
                        reportFiles: 'mochawesome.html',
                        reportName: 'Test Report'
                    ])
                }
            }
        }
    }
}
```

### GitHub Actions Example

```yaml
name: Docker Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run Tests
        run: |
          cd testcases
          docker-compose -f docker-compose.full.yml --profile test up --build --abort-on-container-exit
      
      - name: Upload Test Results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: testcases/test-results/
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Selenium Grid Documentation](https://selenium-python.readthedocs.io/installation.html#drivers)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
