pipeline {
  agent any

  environment {
    PROJECT_NAME = 'todo'
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

  }
}
