# Production-Grade Microservices Deployment on AWS EKS

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
eksctl create cluster -f infrastructure/eks-cluster.yaml -n production
```

### Build & Push Docker Images

```console
docker build -t mituldaundkar/backend:latest Task1/app/backend
docker build -t mituldaundkar/frontend:latest Task1/app/frontend

docker push mituldaundkar/backend:latest
docker push mituldaundkar/frontend:latest
```
![images screenshot](Task1\image.png)

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