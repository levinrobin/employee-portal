# Secret for DB password

resource "google_secret_manager_secret" "db_password" {

  secret_id = "${var.app_name}-db-password"

  project   = var.project_id

  replication {

    auto {}

  }

}

resource "google_secret_manager_secret_version" "db_password" {

  secret      = google_secret_manager_secret.db_password.id

  secret_data = var.db_password

}

# Secret for full DB connection URL

resource "google_secret_manager_secret" "db_url" {

  secret_id = "${var.app_name}-db-url"

  project   = var.project_id

  replication {

    auto {}

  }

}

resource "google_secret_manager_secret_version" "db_url" {

  secret      = google_secret_manager_secret.db_url.id

  secret_data = "postgresql://${var.db_user}:${var.db_password}@${google_sql_database_instance.main.private_ip_address}:5432/${var.db_name}"

}
 