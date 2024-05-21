provider "kubernetes" {
  config_path = "~/.kube/config"
}

resource "kubernetes_config_map" "microservice_config" {
  metadata {
    name      = "microservice-config"
    namespace = var.namespace
  }

  data = var.config_map_data
}

resource "kubernetes_deployment" "microservice" {
  for_each = toset(var.image_urls)

  metadata {
    name      = "microservice-${basename(each.key)}"
    namespace = var.namespace
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = "microservice-${basename(each.key)}"
      }
    }

    template {
      metadata {
        labels = {
          app = "microservice-${basename(each.key)}"
        }
      }

      spec {
        container {
          name  = "microservice-${basename(each.key)}"
          image = each.key
          port {
            container_port = 80
          }

          resources {
            requests = {
              cpu    = "250m"
              memory = "512Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "1Gi"
            }
          }
          env_from {
            config_map_ref {
              name = kubernetes_config_map.microservice_config.metadata[0].name
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "microservice" {
  for_each = toset(var.image_urls)

  metadata {
    name      = "microservice-${basename(each.key)}"
    namespace = var.namespace
  }

  spec {
    selector = {
      app = "microservice-${basename(each.key)}"
    }

    port {
      port        = 80
      target_port = 80
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_ingress_v1" "api_ingress" {
  metadata {
    name      = "api-ingress"
    namespace = var.namespace
  }

  spec {
    rule {
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = "microservice-exec-api"
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_horizontal_pod_autoscaler" "microservice" {
  for_each = toset(var.image_urls)

  metadata {
    name      = "microservice-hpa-${basename(each.key)}"
    namespace = var.namespace
  }

  spec {
    scale_target_ref {
      kind        = "Deployment"
      name        = kubernetes_deployment.microservice[each.key].metadata[0].name
      api_version = "apps/v1"
    }

    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    target_cpu_utilization_percentage = var.cpu_threshold
  }
}
