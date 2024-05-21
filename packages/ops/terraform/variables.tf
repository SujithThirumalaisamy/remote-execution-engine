variable "kubernetes_cluster_name" {
  description = "The name of the Kubernetes cluster"
}

variable "namespace" {
  description = "The namespace to deploy resources in"
  default     = "default"
}

variable "image_urls" {
  description = "List of Docker image URLs for the microservice containers"
  type        = list(string)
  default     = ["docker.io/sujiththirumalaisamy/exec-api/latest", "docker.io/sujiththirumalaisamy/exec-cleaner/latest", "docker.io/sujiththirumalaisamy/exec-worker/latest"]
}

variable "replicas" {
  description = "Initial number of replicas"
  default     = 1
}

variable "max_replicas" {
  description = "Maximum number of replicas for auto-scaling"
  default     = 10
}

variable "min_replicas" {
  description = "Minimum number of replicas for auto-scaling"
  default     = 1
}

variable "cpu_threshold" {
  description = "CPU utilization threshold for auto-scaling"
  default     = 50
}

variable "config_map_data" {
  description = "Configuration data for the ConfigMap"
  type        = map(string)
  default = {
    API_URL                = "api:3000"
    CONTAINER_REG_BASE_URL = "sujiththirumalaisamy"
    DATABASE_URL           = "postgresql://postgres:sujith2023@192.168.1.100:5432/remote-execution-engine?schema=public"
    IMAGE_BASE_NAME        = "exec"
    IMAGE_TAG              = "latest"
    PORT                   = "80"
    REDIS_URL              = "redis://192.168.1.100:6379"
    TESTCASES_GIT          = "https://github.com/SujithThirumalaisamy/testcases-ee.git"
  }
}

variable "storage_class_name" {
  description = "The name of the StorageClass for Persistent Volumes"
  default     = "standard"
}

variable "storage_size" {
  description = "The size of the Persistent Volume"
  default     = "1Gi"
}
