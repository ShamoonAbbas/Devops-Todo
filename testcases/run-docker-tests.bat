@echo off
REM Todo Application Test Runner Script for Windows
REM This script helps run tests in different environments

setlocal enabledelayedexpansion

REM Function to print colored output (limited in Windows batch)
:print_status
echo [INFO] %~1
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

REM Function to check if Docker is running
:check_docker
docker info >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not running. Please start Docker and try again."
    exit /b 1
)
call :print_success "Docker is running"
goto :eof

REM Function to check if docker-compose is available
:check_docker_compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :print_error "docker-compose is not installed. Please install docker-compose and try again."
    exit /b 1
)
call :print_success "docker-compose is available"
goto :eof

REM Function to run tests locally
:run_local_tests
call :print_status "Running tests locally..."

if not exist "node_modules" (
    call :print_status "Installing dependencies..."
    npm install
)

npm test
goto :eof

REM Function to run tests in Docker
:run_docker_tests
call :print_status "Running tests in Docker (standalone)..."

docker-compose up --build test-runner
goto :eof

REM Function to run tests with full stack
:run_full_stack_tests
call :print_status "Running tests with full application stack..."

call :print_status "Starting Todo application stack..."
docker-compose -f docker-compose.full.yml up -d mongo backend frontend

call :print_status "Waiting for services to be ready..."
timeout /t 30 /nobreak >nul

call :print_status "Running tests..."
docker-compose -f docker-compose.full.yml --profile test up --build test-runner

call :print_status "Cleaning up..."
docker-compose -f docker-compose.full.yml down -v
goto :eof

REM Function to run tests with Selenium Grid
:run_grid_tests
call :print_status "Running tests with Selenium Grid..."

call :print_status "Starting Todo application and Selenium Grid..."
docker-compose -f docker-compose.full.yml up -d mongo backend frontend selenium-hub chrome

call :print_status "Waiting for services to be ready..."
timeout /t 45 /nobreak >nul

call :print_status "Running tests with Selenium Grid..."
docker-compose -f docker-compose.full.yml --profile grid-test up --build test-runner-grid

call :print_status "Cleaning up..."
docker-compose -f docker-compose.full.yml down -v
goto :eof

REM Function to start report server
:start_report_server
call :print_status "Starting test report server..."

if not exist "test-results" (
    call :print_warning "No test results found. Running tests first..."
    call :run_docker_tests
)

docker-compose --profile reports up -d test-reports

call :print_success "Test report server started at http://localhost:8080"
call :print_status "Press Ctrl+C to stop the server"

pause
docker-compose --profile reports down
goto :eof

REM Function to cleanup
:cleanup
call :print_status "Cleaning up Docker resources..."

docker-compose down -v 2>nul
docker-compose -f docker-compose.full.yml down -v 2>nul

docker system prune -f

call :print_success "Cleanup completed"
goto :eof

REM Function to show usage
:show_usage
echo Todo Application Test Runner for Windows
echo.
echo Usage: %~nx0 [COMMAND]
echo.
echo Commands:
echo   local          Run tests locally (requires Node.js and Chrome)
echo   docker         Run tests in Docker container (standalone)
echo   full           Run tests with full application stack
echo   grid           Run tests with Selenium Grid
echo   reports        Start test report server
echo   cleanup        Clean up Docker resources
echo   help           Show this help message
echo.
echo Examples:
echo   %~nx0 local       # Run tests on local machine
echo   %~nx0 docker      # Run tests in Docker
echo   %~nx0 full        # Run full stack test
echo   %~nx0 grid        # Run with Selenium Grid
echo   %~nx0 reports     # View test reports
echo.
goto :eof

REM Main script logic
if "%1"=="local" (
    call :run_local_tests
) else if "%1"=="docker" (
    call :check_docker
    call :check_docker_compose
    call :run_docker_tests
) else if "%1"=="full" (
    call :check_docker
    call :check_docker_compose
    call :run_full_stack_tests
) else if "%1"=="grid" (
    call :check_docker
    call :check_docker_compose
    call :run_grid_tests
) else if "%1"=="reports" (
    call :check_docker
    call :check_docker_compose
    call :start_report_server
) else if "%1"=="cleanup" (
    call :check_docker
    call :check_docker_compose
    call :cleanup
) else (
    call :show_usage
)
