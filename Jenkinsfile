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
          sh """
            ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
              # Login to ECR on EC2 instance
              aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin 494066294799.dkr.ecr.us-east-1.amazonaws.com
              
              # Pull the new image
              docker pull ${ECR_URI}:${IMAGE_TAG}
              
              # Stop and remove old container
              docker stop nodejs-app || true
              docker rm nodejs-app || true
              
              # Run new container
              docker run -d --name nodejs-app -p 5000:5000 ${ECR_URI}:${IMAGE_TAG}
              
              # Clean up old images (optional)
              docker image prune -af
            '
          """
        }
      }
    }
  }
  
  post {
    success { 
      echo "✅ Successfully deployed ${ECR_URI}:${IMAGE_TAG} to EC2"
      echo "🚀 Application available at: http://${EC2_HOST}:5000"
    }
    failure { 
      echo "❌ Pipeline failed - check logs above"
    }
  }
}
