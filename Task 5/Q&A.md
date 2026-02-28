# 1.	Explain the role of Istio in a Kubernetes environment. How does the sidecar proxy model work, and what problems does it solve compared to application-level networking?

 Answer:

 Istio is a service mesh used in Kubernetes to manage communication between microservices.

In a microservices architecture, services constantly talk to each other. Instead of handling things like security, retries, load balancing, and monitoring inside the application code, Istio handles them at the infrastructure level.

Istio works using the sidecar proxy model. For every pod, Istio injects a sidecar container (usually Envoy). All incoming and outgoing traffic from the application goes through this sidecar proxy. So services don’t communicate directly — they communicate through their proxies.

This solves several problems:
**
    Provides automatic mTLS encryption between services

    Enables traffic control like routing, canary deployments, and blue-green deployments

    Adds retries, timeouts, and circuit breaking without changing application code

    Gives observability like metrics, logs, and tracing**

Compared to application-level networking, Istio removes the need to write networking logic inside each service. It centralizes traffic management, improves security, and makes the system easier to manage and scale.


# 2.	Describe the difference between PeerAuthentication and AuthorizationPolicy in Istio. How would you enforce strict mTLS across all services in a namespace?

Answer:

PeerAuthentication and AuthorizationPolicy in Istio serve two different purposes.

PeerAuthentication is used to control how services authenticate each other. It mainly manages mTLS settings. For example, you can set it to STRICT, PERMISSIVE, or DISABLE. If it’s set to STRICT, services must communicate using mutual TLS, otherwise the connection is rejected.

AuthorizationPolicy, on the other hand, controls who is allowed to access a service after authentication is successful. It defines access rules based on service identity, namespace, labels, etc. So it handles permission and access control.

PeerAuthentication = authentication (mTLS enforcement)

AuthorizationPolicy = authorization (who can access what)

To enforce strict mTLS across all services in a namespace, we can create a PeerAuthentication resource in that namespace with "mtls.mode: STRICT". This ensures that all service-to-service communication inside that namespace is encrypted and authenticated using mutual TLS.

# 3.	How does Istio’s traffic management work? Walk through how you would configure a canary deployment using VirtualService and DestinationRule.

Answer:

Istio’s traffic management works by controlling how requests are routed between services using custom resources like VirtualService and DestinationRule.

VirtualService defines how traffic should be routed (for example, send 80% to v1 and 20% to v2).

DestinationRule defines different versions (subsets) of a service and their policies.

Together, they allow advanced routing like canary deployments, blue-green deployments, retries, and fault injection.

How I Would Configure a Canary Deployment

Let’s say I have two versions of a service:

*v1 → stable version

v2 → new version
*
Both versions are deployed in Kubernetes with labels like:

*version: v1

version: v2*

**Step 1: Create a DestinationRule**

`apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: my-service
spec:
  host: my-service
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2`

This tells Istio that v1 and v2 are two versions of the same service.

**Step 2: Create a VirtualService**

Now I define how traffic should be split.

Example: 90% to v1 and 10% to v2 (canary).

`apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: my-service
spec:
  hosts:
  - my-service
  http:
  - route:
    - destination:
        host: my-service
        subset: v1
      weight: 90
    - destination:
        host: my-service
        subset: v2
      weight: 10`

Now:
90% of users go to stable version
10% go to new version

If everything works fine, I gradually increase traffic to v2 (20%, 50%, 100%)


# 4.	What is the Istio Ingress Gateway and how does it differ from a standard Kubernetes Ingress controller?

Answer:

Istio Ingress Gateway is the entry point for external traffic into a service mesh. It manages how outside users access services running inside the Kubernetes cluster.

It is part of Istio and works with Istio resources like Gateway and VirtualService to control routing, security, and traffic policies.

A standard Kubernetes Ingress controller also exposes services to external traffic, but it mainly works at Layer 7 (HTTP/HTTPS routing) and is limited to basic routing and TLS termination.

The main differences are:

*Istio Ingress Gateway is integrated with the service mesh and supports advanced traffic management like canary deployments, traffic shifting, mTLS, authentication, authorization, retries, and observability.

Kubernetes Ingress controller mainly handles simple routing rules and SSL termination.

Istio provides deeper control and security because it works with sidecar proxies and mesh policies.*

In simple terms, a Kubernetes Ingress controller is for basic external access, while Istio Ingress Gateway provides advanced traffic management and security as part of the service mesh.

# 5.	How would you use Istio to improve observability? Which components integrate with Prometheus, Grafana, and distributed tracing tools like Jaeger?

Answer:

Istio improves observability by automatically collecting metrics, logs, and traces for all service-to-service communication without changing application code.

Since every request passes through the Envoy sidecar proxy, Istio can capture detailed information like:

*Request count

Latency

Error rates

Source and destination service*

For monitoring and visualization:

*Prometheus collects metrics from the Envoy sidecars and Istio control plane.

Grafana connects to Prometheus and provides dashboards to visualize traffic, latency, and error rates.

For distributed tracing, Istio integrates with tools like Jaeger or Zipkin. Envoy generates trace data, which is sent to Jaeger so we can see the full request flow across multiple microservices.*

In simple terms:
Envoy sidecars generate metrics and traces → Prometheus collects metrics → Grafana visualizes them → Jaeger shows end-to-end request tracing.

So Istio improves observability by automatically giving deep visibility into service communication without modifying application code.


