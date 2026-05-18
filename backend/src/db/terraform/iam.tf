# Service account for GKE nodes

resource "google_service_account" "gke_nodes" {

  account_id   = "${var.app_name}-gke-sa"

  display_name = "GKE Nodes SA for ${var.app_name}"

  project      = var.project_id

}

# GKE nodes can pull images from Artifact Registry

resource "google_project_iam_member" "gke_artifact_reader" {

  project = var.project_id

  role    = "roles/artifactregistry.reader"

  member  = "serviceAccount:${google_service_account.gke_nodes.email}"

}

# GKE nodes can write logs

resource "google_project_iam_member" "gke_logging" {

  project = var.project_id

  role    = "roles/logging.logWriter"

  member  = "serviceAccount:${google_service_account.gke_nodes.email}"

}

# GKE nodes can write metrics

resource "google_project_iam_member" "gke_monitoring_writer" {

  project = var.project_id

  role    = "roles/monitoring.metricWriter"

  member  = "serviceAccount:${google_service_account.gke_nodes.email}"

}

# GKE nodes can write monitoring data

resource "google_project_iam_member" "gke_monitoring_viewer" {

  project = var.project_id

  role    = "roles/monitoring.viewer"

  member  = "serviceAccount:${google_service_account.gke_nodes.email}"

}

# Service account for the backend application pod

resource "google_service_account" "backend_app" {

  account_id   = "${var.app_name}-backend-sa"

  display_name = "Backend App SA for ${var.app_name}"

  project      = var.project_id

}

# Backend can read secrets from Secret Manager

resource "google_project_iam_member" "backend_secret_accessor" {

  project = var.project_id

  role    = "roles/secretmanager.secretAccessor"

  member  = "serviceAccount:${google_service_account.backend_app.email}"

}

# Backend can connect to Cloud SQL

resource "google_project_iam_member" "backend_cloudsql_client" {

  project = var.project_id

  role    = "roles/cloudsql.client"

  member  = "serviceAccount:${google_service_account.backend_app.email}"

}

# Workload Identity — links K8s service account to GCP service account

resource "google_service_account_iam_member" "workload_identity_binding" {

  service_account_id = google_service_account.backend_app.name

  role               = "roles/iam.workloadIdentityUser"

  member             = "serviceAccount:${var.project_id}.svc.id.goog[default/backend-ksa]"

}
 