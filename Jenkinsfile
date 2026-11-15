pipeline {
    agent any

    tools {
        maven 'Maven 3.9.9'
        jdk 'JDK 21'
        nodejs 'NodeJS 20'
    }

    environment {
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_BACKEND = 'shopsphere-backend'
        IMAGE_FRONTEND = 'shopsphere-frontend'
        TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('2. Backend Build') {
            steps {
                echo 'Building Spring Boot backend...'
                dir('backend') {
                    sh 'mvn clean compile -DskipTests'
                }
            }
        }

        stage('3. Backend Tests') {
            steps {
                echo 'Executing Backend Unit and Concurrency Integration Tests...'
                dir('backend') {
                    sh 'mvn test'
                }
            }
            post {
                always {
                    junit 'backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('4. Frontend Dependency Installation') {
            steps {
                echo 'Installing Frontend npm packages...'
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('5. Frontend Lint and Tests') {
            steps {
                echo 'Running Frontend Vitest and type checks...'
                dir('frontend') {
                    sh 'npm run test:run'
                }
            }
        }

        stage('6. Frontend Production Build') {
            steps {
                echo 'Compiling Frontend production bundle...'
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('7. Docker Image Build') {
            steps {
                echo 'Building container images via Docker Compose...'
                sh 'docker compose build'
            }
        }
    }

    post {
        success {
            echo "ShopSphere CI/CD Pipeline build #${BUILD_NUMBER} completed successfully!"
        }
        failure {
            echo "ShopSphere CI/CD Pipeline build #${BUILD_NUMBER} failed. Review test logs and compiler outputs."
        }
    }
}

