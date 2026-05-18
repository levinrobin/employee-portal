resource "google_artifact_registry_repository" "main" {

  project       = var.project_id

  location      = var.region

  repository_id = var.app_name

  format        = "DOCKER"

  description   = "Docker images for ${var.app_name}"

  depends_on = [google_project_iam_member.gke_artifact_reader]

}
 