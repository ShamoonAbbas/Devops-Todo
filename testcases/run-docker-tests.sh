#!/bin/bash

# Todo Application Test Runner Script
# This script helps run tests in different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose > /dev/null 2>&1; then
        print_error "docker-compose is not installed. Please install docker-compose and try again."
        exit 1
    fi
    print_success "docker-compose is available"
}

# Function to run tests locally (without Docker)
run_local_tests() {
    print_status "Running tests locally..."
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Run tests
    npm test
}

# Function to run tests in Docker (standalone)
run_docker_tests() {
    print_status "Running tests in Docker (standalone)..."
    
    # Build and run tests
    docker-compose up --build test-runner
    
    # Get exit code
    EXIT_CODE=$(docker-compose ps -q test-runner | xargs docker inspect --format='{{.State.ExitCode}}')
    
    if [ "$EXIT_CODE" -eq 0 ]; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed (exit code: $EXIT_CODE)"
        exit $EXIT_CODE
    fi
}

# Function to run tests with full application stack
run_full_stack_tests() {
    print_status "Running tests with full application stack..."
    
    # Start the full stack
    print_status "Starting Todo application stack..."
    docker-compose -f docker-compose.full.yml up -d mongo backend frontend
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Run tests
    print_status "Running tests..."
    docker-compose -f docker-compose.full.yml --profile test up --build test-runner
    
    # Get exit code
    EXIT_CODE=$(docker-compose -f docker-compose.full.yml ps -q test-runner | xargs docker inspect --format='{{.State.ExitCode}}' 2>/dev/null || echo "1")
    
    # Cleanup
    print_status "Cleaning up..."
    docker-compose -f docker-compose.full.yml down -v
    
    if [ "$EXIT_CODE" -eq 0 ]; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed (exit code: $EXIT_CODE)"
        exit $EXIT_CODE
    fi
}

# Function to run tests with Selenium Grid
run_grid_tests() {
    print_status "Running tests with Selenium Grid..."
    
    # Start the full stack with Selenium Grid
    print_status "Starting Todo application and Selenium Grid..."
    docker-compose -f docker-compose.full.yml up -d mongo backend frontend selenium-hub chrome
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 45
    
    # Run tests with Grid
    print_status "Running tests with Selenium Grid..."
    docker-compose -f docker-compose.full.yml --profile grid-test up --build test-runner-grid
    
    # Get exit code
    EXIT_CODE=$(docker-compose -f docker-compose.full.yml ps -q test-runner-grid | xargs docker inspect --format='{{.State.ExitCode}}' 2>/dev/null || echo "1")
    
    # Cleanup
    print_status "Cleaning up..."
    docker-compose -f docker-compose.full.yml down -v
    
    if [ "$EXIT_CODE" -eq 0 ]; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed (exit code: $EXIT_CODE)"
        exit $EXIT_CODE
    fi
}

# Function to start test report server
start_report_server() {
    print_status "Starting test report server..."
    
    # Ensure we have some test results
    if [ ! -d "test-results" ] || [ -z "$(ls -A test-results)" ]; then
        print_warning "No test results found. Running tests first..."
        run_docker_tests
    fi
    
    # Start report server
    docker-compose --profile reports up -d test-reports
    
    print_success "Test report server started at http://localhost:8080"
    print_status "Press Ctrl+C to stop the server"
    
    # Wait for interrupt
    trap 'docker-compose --profile reports down; exit 0' INT
    while true; do sleep 1; done
}

# Function to clean up Docker resources
cleanup() {
    print_status "Cleaning up Docker resources..."
    
    # Stop and remove containers
    docker-compose down -v 2>/dev/null || true
    docker-compose -f docker-compose.full.yml down -v 2>/dev/null || true
    
    # Remove test images
    docker rmi $(docker images | grep todo-test | awk '{print $3}') 2>/dev/null || true
    
    # Prune unused resources
    docker system prune -f
    
    print_success "Cleanup completed"
}

# Function to show usage
show_usage() {
    echo "Todo Application Test Runner"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  local          Run tests locally (requires Node.js and Chrome)"
    echo "  docker         Run tests in Docker container (standalone)"
    echo "  full           Run tests with full application stack"
    echo "  grid           Run tests with Selenium Grid"
    echo "  reports        Start test report server"
    echo "  cleanup        Clean up Docker resources"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local       # Run tests on local machine"
    echo "  $0 docker      # Run tests in Docker"
    echo "  $0 full        # Run full stack test"
    echo "  $0 grid        # Run with Selenium Grid"
    echo "  $0 reports     # View test reports"
    echo ""
}

# Main script logic
main() {
    case "${1:-help}" in
        "local")
            run_local_tests
            ;;
        "docker")
            check_docker
            check_docker_compose
            run_docker_tests
            ;;
        "full")
            check_docker
            check_docker_compose
            run_full_stack_tests
            ;;
        "grid")
            check_docker
            check_docker_compose
            run_grid_tests
            ;;
        "reports")
            check_docker
            check_docker_compose
            start_report_server
            ;;
        "cleanup")
            check_docker
            check_docker_compose
            cleanup
            ;;
        "help"|*)
            show_usage
            ;;
    esac
}

# Run main function with all arguments
main "$@"
