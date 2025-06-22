pipeline {
  agent any

  environment {
    PROJECT_NAME = 'todo'
    TEST_RESULTS_DIR = 'testcases/test-results'
    SCREENSHOTS_DIR = 'testcases/screenshots'
  }

  stages {
    stage('Clone Repository') {
      steps {
        dir('part-2') {
          git branch: 'main', url: 'https://github.com/ShamoonAbbas/Devops-Todo.git'
        }
      }
    }
    
    stage('Build and Deploy') {
      steps {
        script {
            sh 'docker-compose -p $PROJECT_NAME -f docker-compose.yml down -v --remove-orphans || true'
            sh 'docker system prune -af || true'
            sh 'docker volume prune -f || true'
            sh 'docker-compose -p $PROJECT_NAME -f docker-compose.yml up -d --build'
        }
      }
    }

    stage('Wait for Application') {
      steps {
        script {
          echo 'Waiting for application to be ready...'
          sh '''
            timeout 300 bash -c 'until curl -f http://localhost:3100 >/dev/null 2>&1; do 
              echo "Waiting for frontend..."; 
              sleep 5; 
            done'
          '''
          sh '''
            timeout 300 bash -c 'until curl -f http://localhost:5100/health >/dev/null 2>&1; do 
              echo "Waiting for backend..."; 
              sleep 5; 
            done'
          '''
          echo 'Application is ready for testing'
        }
      }
    }

    stage('Run Tests') {
      steps {
        dir('part-2') {
          script {
            try {
              echo 'Setting up test environment...'
              sh 'cd testcases && npm install'
              
              echo 'Running Selenium tests...'
              sh '''
                cd testcases
                mkdir -p test-results screenshots logs
                npm test 2>&1 | tee logs/test-execution.log
              '''
              
              currentBuild.result = 'SUCCESS'
              echo 'All tests passed successfully!'
              
            } catch (Exception e) {
              currentBuild.result = 'FAILURE'
              echo "Tests failed: ${e.getMessage()}"
              
              // Capture application logs for debugging
              sh '''
                echo "=== Application Logs ===" >> testcases/logs/debug.log
                docker-compose -p $PROJECT_NAME logs backend >> testcases/logs/debug.log 2>&1 || true
                docker-compose -p $PROJECT_NAME logs frontend >> testcases/logs/debug.log 2>&1 || true
              '''
              
              throw e
            }
          }
        }
      }
      post {
        always {
          // Archive test results and artifacts
          dir('part-2') {
            archiveArtifacts artifacts: 'testcases/test-results/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: 'testcases/screenshots/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: 'testcases/logs/**/*', allowEmptyArchive: true
            
            // Publish HTML test reports if available
            publishHTML([
              allowMissing: false,
              alwaysLinkToLastBuild: true,
              keepAll: true,
              reportDir: 'testcases/test-results',
              reportFiles: '*.html',
              reportName: 'Test Report'
            ])
            
            // Publish test results if JUnit XML is available
            script {
              if (fileExists('testcases/test-results/*.xml')) {
                publishTestResults testResultsPattern: 'testcases/test-results/*.xml'
              }
            }
          }
        }
        failure {
          script {
            echo 'Tests failed - collecting additional debugging information'
            sh '''
              cd part-2
              echo "=== Docker Container Status ===" >> testcases/logs/debug.log
              docker-compose -p $PROJECT_NAME ps >> testcases/logs/debug.log 2>&1 || true
              
              echo "=== System Resources ===" >> testcases/logs/debug.log
              df -h >> testcases/logs/debug.log 2>&1 || true
              free -h >> testcases/logs/debug.log 2>&1 || true
            '''
          }
        }
      }
    }

  }
  
  post {
    always {
      script {
        // Calculate test duration
        def buildDuration = currentBuild.durationString.replace(' and counting', '')
        def testStatus = currentBuild.result ?: 'SUCCESS'
        
        // Determine email recipients
        def emailRecipients = env.CHANGE_AUTHOR_EMAIL ?: 'devops-team@company.com'
        
        // Count test results if available
        def testSummary = 'Test summary not available'
        try {
          if (fileExists('part-2/testcases/logs/test-execution.log')) {
            def logContent = readFile('part-2/testcases/logs/test-execution.log')
            def passCount = (logContent =~ /(\d+) passing/).collect { it[1] }
            def failCount = (logContent =~ /(\d+) failing/).collect { it[1] }
            
            if (passCount.size() > 0 || failCount.size() > 0) {
              testSummary = "Tests: ${passCount.size() > 0 ? passCount[0] : 0} passed, ${failCount.size() > 0 ? failCount[0] : 0} failed"
            }
          }
        } catch (Exception e) {
          echo "Could not parse test results: ${e.getMessage()}"
        }
        
        // Send email notification
        emailext (
          subject: "Jenkins Build ${testStatus}: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
          body: """
            <html>
            <body>
              <h2>Jenkins Build Notification</h2>
              <table border="1" cellpadding="5" cellspacing="0">
                <tr><td><strong>Project:</strong></td><td>${env.JOB_NAME}</td></tr>
                <tr><td><strong>Build Number:</strong></td><td>${env.BUILD_NUMBER}</td></tr>
                <tr><td><strong>Build Status:</strong></td><td style="color: ${testStatus == 'SUCCESS' ? 'green' : 'red'}"><strong>${testStatus}</strong></td></tr>
                <tr><td><strong>Build Duration:</strong></td><td>${buildDuration}</td></tr>
                <tr><td><strong>Test Summary:</strong></td><td>${testSummary}</td></tr>
                <tr><td><strong>Build URL:</strong></td><td><a href="${env.BUILD_URL}">${env.BUILD_URL}</a></td></tr>
              </table>
              
              <h3>Build Details:</h3>
              <ul>
                <li><strong>Git Branch:</strong> main</li>
                <li><strong>Git Commit:</strong> ${env.GIT_COMMIT?.take(8) ?: 'N/A'}</li>
                <li><strong>Started By:</strong> ${env.BUILD_USER ?: 'Jenkins'}</li>
                <li><strong>Node:</strong> ${env.NODE_NAME ?: 'Unknown'}</li>
              </ul>
              
              <h3>Application URLs:</h3>
              <ul>
                <li><strong>Frontend:</strong> <a href="http://localhost:3100">http://localhost:3100</a></li>
                <li><strong>Backend:</strong> <a href="http://localhost:5100/health">http://localhost:5100/health</a></li>
              </ul>
              
              ${testStatus == 'SUCCESS' ? 
                '<p style="color: green;"><strong>✅ All tests passed successfully!</strong></p>' : 
                '<p style="color: red;"><strong>❌ Some tests failed. Please check the build logs and test reports for details.</strong></p>'
              }
              
              <h3>Available Reports:</h3>
              <ul>
                <li><a href="${env.BUILD_URL}Test_Report/">Test Report</a></li>
                <li><a href="${env.BUILD_URL}artifact/testcases/test-results/">Test Results</a></li>
                <li><a href="${env.BUILD_URL}artifact/testcases/screenshots/">Screenshots</a></li>
                <li><a href="${env.BUILD_URL}console">Console Output</a></li>
              </ul>
              
              <p><small>This email was automatically generated by Jenkins CI/CD pipeline.</small></p>
            </body>
            </html>
          """,
          mimeType: 'text/html',
          to: emailRecipients,
          attachLog: testStatus != 'SUCCESS',
          attachmentsPattern: testStatus != 'SUCCESS' ? 'part-2/testcases/logs/debug.log' : ''
        )
      }
    }
    
    success {
      echo '✅ Pipeline completed successfully!'
      echo '📊 Test reports available at: ${env.BUILD_URL}Test_Report/'
      echo '🚀 Application deployed and tested successfully'
    }
    
    failure {
      echo '❌ Pipeline failed!'
      echo '📋 Check test reports and logs for details'
      echo '🔍 Debug logs attached to email notification'
    }
    
    cleanup {
      script {
        echo 'Cleaning up test environment...'
        sh '''
          cd part-2 || true
          docker-compose -p $PROJECT_NAME logs > jenkins-docker-logs.txt 2>&1 || true
          docker-compose -p $PROJECT_NAME down -v --remove-orphans || true
        '''
      }
    }
  }
}
