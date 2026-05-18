resource "google_container_cluster" "main" {

  name     = "${var.app_name}-cluster"

  location = var.zone

  project  = var.project_id

  remove_default_node_pool = true

  initial_node_count       = 1

  network    = google_compute_network.main.name

  subnetwork = google_compute_subnetwork.gke.name

  networking_mode = "VPC_NATIVE"

  ip_allocation_policy {

    cluster_secondary_range_name  = "pods"

    services_secondary_range_name = "services"

  }

  master_authorized_networks_config {

    cidr_blocks {

      cidr_block   = "0.0.0.0/0"

      display_name = "all"

    }

  }

  workload_identity_config {

    workload_pool = "${var.project_id}.svc.id.goog"

  }

  addons_config {

    http_load_balancing {

      disabled = false

    }

    horizontal_pod_autoscaling {

      disabled = false

    }

  }

  release_channel {

    channel = "REGULAR"

  }

  deletion_protection = false

  depends_on = [

    google_compute_subnetwork.gke,

    google_service_account.gke_nodes

  ]

}

resource "google_container_node_pool" "main" {

  name       = "${var.app_name}-node-pool"

  location   = var.zone

  cluster    = google_container_cluster.main.name

  project    = var.project_id

  node_count = var.gke_node_count

  node_config {

    machine_type    = var.gke_machine_type

    service_account = google_service_account.gke_nodes.email

    disk_size_gb    = 50

    disk_type       = "pd-standard"

    oauth_scopes = [

      "https://www.googleapis.com/auth/cloud-platform"

    ]

    workload_metadata_config {

      mode = "GKE_METADATA"

    }

    labels = {

      env = var.environment

      app = var.app_name

    }

    shielded_instance_config {

      enable_secure_boot          = true

      enable_integrity_monitoring = true

    }

  }

  management {

    auto_repair  = true

    auto_upgrade = true

  }

  autoscaling {

    min_node_count = 1

    max_node_count = 3

  }

  depends_on = [google_container_cluster.main]

}
 