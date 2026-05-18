# Cloud SQL PostgreSQL instance

resource "google_sql_database_instance" "main" {

  name             = "${var.app_name}-postgres"

  database_version = "POSTGRES_15"

  region           = var.region

  project          = var.project_id

  deletion_protection = false

  settings {

    tier              = var.db_tier

    availability_type = "ZONAL"

    disk_size         = 20

    disk_type         = "PD_SSD"

    ip_configuration {

      ipv4_enabled    = false

      private_network = google_compute_network.main.id

    }

    backup_configuration {

      enabled    = true

      start_time = "02:00"

      backup_retention_settings {

        retained_backups = 7

      }

    }

    database_flags {

      name  = "max_connections"

      value = "100"

    }

  }

  depends_on = [google_service_networking_connection.private_vpc_connection]

}

# Database

resource "google_sql_database" "main" {

  name     = var.db_name

  instance = google_sql_database_instance.main.name

  project  = var.project_id

}

# Database user

resource "google_sql_user" "main" {

  name     = var.db_user

  instance = google_sql_database_instance.main.name

  password = var.db_password

  project  = var.project_id

}
 