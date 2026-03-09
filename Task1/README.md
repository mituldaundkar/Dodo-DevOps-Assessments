# Task 1: Kubernetes Cluster Setup & Microservices Deployment

This project demonstrates a production-style deployment of a 3-tier microservices application on Amazon EKS using fully declarative Kubernetes YAML manifests.

## Project Overview

The application consists of:
- Frontend – Static HTML served via NGINX
- Backend – Node.js + Express API
- Database – PostgreSQL deployed as StatefulSet
- Ingress – AWS ALB
- Autoscaling – Horizontal Pod Autoscaler (HPA)

## Architecture

Traffic Flow:

```console
User → AWS ALB Ingress → Frontend → Backend API → PostgreSQL
```
## EKS Cluster Setup

```console
eksctl create cluster -f ms-cluster.yaml -n production
```

### Build & Push Docker Images

```console
docker build -t mituldaundkar/backend:latest Task1/app/backend
docker build -t mituldaundkar/frontend:latest Task1/app/frontend

docker push mituldaundkar/backend:latest
docker push mituldaundkar/frontend:latest
```

### Deploy Application

```console
kubectl apply -f k8s/
```
Verify resources:

```console
kubectl get pods -n production
kubectl get svc -n production
kubectl get ingress -n production
kubectl get hpa -n production
```

### Horizontal Pod Autoscaler

Backend configuration:
- Min replicas: 2
- Max replicas: 6
- CPU target: 60%

Check status:

```console
kubectl describe hpa backend-hpa -n production
```

### Security Best Practices Implemented

- Namespace isolation
- Resource requests & limits
- Non-root containers
- Read-only root filesystem
- Secrets separated from ConfigMaps
- No hardcoded credentials
- Stateful workload isolation
- Controlled autoscaling

## Note on Instance Type & Resource Constraints

This cluster was provisioned using **t3.small** instances due to **AWS Free Tier** limitations. As a result, available CPU and memory resources are limited.

Because of these constraints, some pods (particularly backend and database components) may experience:

- Delayed scheduling
- Restart loops under load
- Resource throttling
- Limited autoscaling behavior

In a production environment, this workload should run on at least **t3.medium** or **larger** instances to ensure stable performance and proper scaling.

This limitation does not affect the architectural design or deployment methodology, but only the available runtime resources.

***(Actual screenshot images are also available in the Task 1 directory)***