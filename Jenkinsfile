pipeline {
  agent any

  environment {
    // Jenkins credentials IDs - create these in Jenkins and replace below IDs
    DOCKERHUB_CREDENTIALS = 'dockerhub-creds' // username/password or token stored as "Username with password"
    // optionally set Docker Hub repo name here, or compute from env
    DOCKERHUB_REPO = "your-dockerhub-username/jenkins-docker-sample"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Unit Tests') {
      steps {
        sh 'npm ci'
        sh 'npm test'
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          // short commit hash
          GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD || echo local", returnStdout: true).trim()
          IMAGE_TAG = "${DOCKERHUB_REPO}:${GIT_COMMIT_SHORT}"
          LATEST_TAG = "${DOCKERHUB_REPO}:latest"

          // Build image
          sh "docker build -t ${IMAGE_TAG} -t ${LATEST_TAG} ."
        }
      }
    }

    stage('Login & Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            set -e
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push ${IMAGE_TAG}
            docker push ${LATEST_TAG}
          '''
        }
      }
    }
  }

  post {
    success {
      echo "Build and push succeeded: ${IMAGE_TAG}"
    }
    failure {
      echo "Pipeline failed — check console output"
    }
    always {
      // Cleanup optional
      sh "docker image prune -af || true"
    }
  }
}
