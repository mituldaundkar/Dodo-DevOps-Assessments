# Java CI/CD Pipeline with Blue-Green Deployment

This project demonstrates a complete CI/CD pipeline for a Java application using:

- Jenkins (Declarative Pipeline)
- Maven (Build & Testing)
- SonarQube (Static Code Analysis)
- Docker (Containerization)
- Docker Hub (Image Registry)
- Kubernetes (Production Deployment)
- Blue-Green Deployment Strategy

The pipeline includes:

- Code checkout
- Maven build & unit testing
- SonarQube static code analysis
- Docker image build & push
- Deploy new version to Green environment
- Manual traffic switch from Blue → Green
- Instant rollback capability

## Architecture Overview:

```console
Developer → GitHub → Jenkins Pipeline
   ↓
Maven Build & Test
   ↓
SonarQube Scan
   ↓
Docker Build & Push
   ↓
Deploy to GREEN (Idle Environment)
   ↓
Manual Approval
   ↓
Switch Service Traffic (BLUE → GREEN)
   ↓
Rollback possible anytime
```


# Blue-Green Deployment Explanation:

Two identical environments exist in production:

- Blue → Currently live version
- Green → New version (idle until promoted)

The Kubernetes Service determines which environment receives traffic.
Traffic switching is done by updating the Service selector.

## Prerequisites & Dependencies:

All dependencies must be installed on the Jenkins server.

### Install Java (JDK 17)

```console
sudo apt update
sudo apt install openjdk-17-jdk -y
java -version
```

### Install Maven

```console
sudo apt install maven -y
mvn -version
```

### Install Docker

```console
sudo apt install docker.io -y
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Install kubectl

```console
curl -LO "https://dl.k8s.io/release/stable/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client
```

### Jenkins Plugin Installation

Go to:
**Manage Jenkins → Manage Plugins**

***Install:***
- Pipeline
- Git
- GitHub Integration
- Credentials Binding
- Docker Pipeline
- Kubernetes CLI
- SonarQube Scanner
- JUnit

Restart Jenkins after installation.

## Configure Global Tools in Jenkins:

Go to:
**Manage Jenkins → Global Tool Configuration**

Add:

***JDK***
Name: ***JDK17***

***Maven***
Name: ***Maven3***

## SonarQube Setup:

Run SonarQube Using Docker:

```console
docker run -d -p 9000:9000 sonarqube:lts
```

Access:

```console
http://<server-ip>:9000
```

***Steps:***

1. Login (admin/admin)
2. Create project
3. Generate authentication token

### Configure SonarQube in Jenkins

Go to:
**Manage Jenkins → Configure System**

- Add SonarQube Server
- Name: *SonarQube*
- Add generated token

## Jenkins Credentials Setup:

Go to:
**Manage Jenkins → Credentials**

Add:

***DockerHub Credentials***

- Type: Username & Password
- ID: dockerhub-creds

***Kubernetes kubeconfig***

- Type: Secret File
- ID: kubeconfig

## Kubernetes Setup

Ensure you have:

- Running Kubernetes cluster (EKS)
- Namespace created:

```console
kubectl create namespace production
```
### Kubernetes Blue Deployment

```console
apiVersion: apps/v1
kind: Deployment
metadata:
  name: java-app-blue
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: java-app
      version: blue
  template:
    metadata:
      labels:
        app: java-app
        version: blue
    spec:
      containers:
        - name: java-app
          image: mituldaundkar/java-app:initial
          ports:
            - containerPort: 8080
```

### Kubernetes Green Deployment

```console
apiVersion: apps/v1
kind: Deployment
metadata:
  name: java-app-green
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: java-app
      version: green
  template:
    metadata:
      labels:
        app: java-app
        version: green
    spec:
      containers:
        - name: java-app
          image: mituldaundkar/java-app:initial
          ports:
            - containerPort: 8080
```
### Kubernetes Service

```console
apiVersion: v1
kind: Service
metadata:
  name: java-app-service
  namespace: production
spec:
  selector:
    app: java-app
    version: blue   # Initially pointing to blue
  ports:
    - port: 80
      targetPort: 8080
```

Initially, traffic points to blue.

## Dockerfile (Multi-Stage Build)

```console
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Rollback Procedure

Rollback is instant.

Switch traffic back to Blue:

```console
kubectl patch service java-app-service -n production \
-p '{"spec":{"selector":{"app":"java-app","version":"blue"}}}'
```
No downtime. No redeployment required.

## Workflow:

```console
feature/* → PR → CI → Review → Merge → Deploy
```
