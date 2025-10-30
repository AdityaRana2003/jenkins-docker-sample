pipeline {
  agent any

  environment {
    IMAGE_NAME = "adityarana2003/jenkins-docker-sample"   // change to your Docker Hub repo if needed
    IMAGE_TAG  = "${env.BUILD_ID}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Unit Tests (in Node container)') {
      steps {
        script {
          // Run npm commands inside an official Node container, workspace is mounted
          docker.image('node:20-bullseye').inside("-u root:root -v ${env.WORKSPACE}:/workspace -w /workspace") {
            sh '''
              npm ci
              npm test || true   # remove "|| true" if you want tests to fail the build on test failures
            '''
          }
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          // This uses host's docker CLI — ensure Docker daemon is available to Jenkins user
          sh """
            docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
          """
        }
      }
    }

    stage('Login & Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
          sh '''
            echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin
            docker push ${IMAGE_NAME}:${IMAGE_TAG}
            docker logout
          '''
        }
      }
    }
  }

  post {
    always {
      sh 'docker image prune -af || true'
    }
    success {
      echo "Succeeded: ${IMAGE_NAME}:${IMAGE_TAG}"
    }
    failure {
      echo "Pipeline failed — check console output"
    }
  }
}
