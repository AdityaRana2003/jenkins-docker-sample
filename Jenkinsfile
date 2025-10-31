pipeline {
  agent any                       // change to label 'docker' if you have a docker-enabled agent: agent { label 'docker' }

  environment {
    IMAGE_NAME = "adityarana2003/jenkins-docker-sample"   // change to your Docker Hub repo if needed
    IMAGE_TAG  = "${env.BUILD_NUMBER}"
  }

  options {
    // keep only last X builds to save disk
    buildDiscarder(logRotator(numToKeepStr: '20'))
    // fail the pipeline faster if something goes wrong
    timestamps()
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
          // docker.image(...).inside already mounts the workspace to the container's workspace path,
          // so additional -v is unnecessary and can cause permission/path problems.
          docker.image('node:20-bullseye').inside {
            sh '''
              npm ci
              npm test || true   # remove "|| true" if you want test failures to fail the build
            '''
          }
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          // Use the docker pipeline plugin's docker.build which returns an image object
          def img = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
          // tag the "latest" as well (optional)
          sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest || true"
          // stash the image object for push stage (pass via env var name)
          env.BUILT_IMAGE = "${IMAGE_NAME}:${IMAGE_TAG}"
        }
      }
    }

    stage('Login & Push to Docker Hub') {
      when {
        expression { return env.BUILT_IMAGE != null && env.BUILT_IMAGE.trim() != "" }
      }
      steps {
        // uses the docker pipeline plugin to handle login + push
        script {
          docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-creds') {
            sh "docker push ${env.BUILT_IMAGE}"
            sh "docker push ${IMAGE_NAME}:latest || true"
          }
        }
      }
    }
  }

  post {
    always {
      // best-effort cleanup (won't fail pipeline)
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
