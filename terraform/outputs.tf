output "gke_cluster_name" {

  description = "GKE cluster name"

  value       = google_container_cluster.main.name

}

output "gke_cluster_endpoint" {

  description = "GKE cluster endpoint"

  value       = google_container_cluster.main.endpoint

  sensitive   = true

}

output "artifact_registry_url" {

  description = "Artifact Registry base URL for Docker images"

  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${var.app_name}"

}

output "db_private_ip" {

  description = "Cloud SQL private IP"

  value       = google_sql_database_instance.main.private_ip_address

  sensitive   = true

}

output "db_connection_name" {

  description = "Cloud SQL connection name"

  value       = google_sql_database_instance.main.connection_name

}

output "db_secret_id" {

  description = "Secret Manager secret ID for DB URL"

  value       = google_secret_manager_secret.db_url.secret_id

}
 