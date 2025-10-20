pipeline {
  agent any
  environment {
    AWS_REGION = 'us-east-1'
    ECR_URI = '494066294799.dkr.ecr.us-east-1.amazonaws.com/nodejs-app'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    EC2_HOST = '52.90.125.157'
    EC2_USER = 'ubuntu'
  }
  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/Maged-Naim/nodejs-cicd-pipeline.git'
      }
    }
    
    stage('Build') {
      steps {
        sh 'docker build -t nodejs-cicd-pipeline:${IMAGE_TAG} .'
      }
    }
    
    stage('Login to ECR & Push') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-ecr-creds']]) {
          sh '''
            aws ecr get-login-password --region $AWS_REGION \
              | docker login --username AWS --password-stdin 494066294799.dkr.ecr.us-east-1.amazonaws.com
            docker tag nodejs-cicd-pipeline:${IMAGE_TAG} $ECR_URI:${IMAGE_TAG}
            docker push $ECR_URI:${IMAGE_TAG}
          '''
        }
      }
    }
    
    stage('Deploy to EC2') {
      steps {
        sshagent(['ec2-ssh-key']) {
          sh '''
            ssh -o StrictHostKeyChecking=no ubuntu@52.90.125.157 '
              # Login to ECR on EC2 instance
              aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 494066294799.dkr.ecr.us-east-1.amazonaws.com
              
              # Pull the new image
              docker pull 494066294799.dkr.ecr.us-east-1.amazonaws.com/nodejs-app:${BUILD_NUMBER}
              
              # Stop and remove ANY container named nodejs-app
              docker stop nodejs-app 2>/dev/null || true
              docker rm -f nodejs-app 2>/dev/null || true
              
              # Also kill any container using port 5000 (backup cleanup)
              CONTAINER_ON_PORT=$(docker ps -q --filter "publish=5000")
              if [ ! -z "$CONTAINER_ON_PORT" ]; then
                echo "Found container on port 5000: $CONTAINER_ON_PORT"
                docker stop $CONTAINER_ON_PORT || true
                docker rm -f $CONTAINER_ON_PORT || true
              fi
              
              # Run new container
              docker run -d --name nodejs-app -p 5000:5000 494066294799.dkr.ecr.us-east-1.amazonaws.com/nodejs-app:${BUILD_NUMBER}
              
              # Verify container is running
              docker ps | grep nodejs-app
              
              # Clean up old images (optional)
              docker image prune -af
            '
          '''
        }
      }
    }
  }
  
  post {
    success {
      echo '✅ Successfully deployed 494066294799.dkr.ecr.us-east-1.amazonaws.com/nodejs-app:${BUILD_NUMBER} to EC2'
      echo '🚀 Application available at: http://52.90.125.157:5000'
    }
    failure {
      echo '❌ Pipeline failed - check logs above'
    }
  }
}

