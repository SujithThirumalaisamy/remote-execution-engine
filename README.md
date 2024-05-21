# Remote Execution Engine
## Local Run without Docker Compose
Clone the repository
```
git clone https://github.com/SujithThirumalaisamy/remote-execution-engine.git
```
Build all the service Images
```
docker build -t <repo>/<service>:latest -f .\apps\<service>\Dockerfile .
```
Push all the images to DockerHub
```
docker push <repo>/<service>:latest
```
Provision the following Resources
- A local kubernetes cluster (For example Rancherk3s)
- Create a NFS Network share in any of you computing resources
  - Or any other Persistent Volume option for kubernetes will work
  - persistent-volume and persistent-volume-claim config should be changed as according
  - The NFS Storage is only to store the configs and the SSL Keys. Minimum will be fine
- Create a PostgreSQL Database
- Create a Redis DB ( DBs can also be created inside the kube cluster itself with StatefulSets)
- Use the sample *.yml files in the `/packages/ops` folder to create the following resources
  - Create a persistent volume
  - Create a persistent volume Claim
  - Create a config map
  - Add the Kubernetes config to the persistent storage created
  - Deploy the `deployment.yml` manifest with the appropriate storage options
  - Create a Service to expose the application
  - Create a intress with a ingress controller
  - Configure DNS Resolution of the API
  - Install SSL Certificates in the ingress controller
# Remote Code Executition Engine
![daily-code drawio (1)](https://github.com/SujithThirumalaisamy/remote-execution-engine/assets/108384868/32aabe0d-ed99-4ced-81ff-5db5180edafa)
