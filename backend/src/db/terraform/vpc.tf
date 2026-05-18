# VPC Network

resource "google_compute_network" "main" {

  name                    = "${var.app_name}-vpc"

  auto_create_subnetworks = false

  project                 = var.project_id

}

# Subnet for GKE nodes

resource "google_compute_subnetwork" "gke" {

  name          = "${var.app_name}-gke-subnet"

  ip_cidr_range = "10.0.0.0/20"

  region        = var.region

  network       = google_compute_network.main.id

  project       = var.project_id

  secondary_ip_range {

    range_name    = "pods"

    ip_cidr_range = "10.48.0.0/14"

  }

  secondary_ip_range {

    range_name    = "services"

    ip_cidr_range = "10.52.0.0/20"

  }

  private_ip_google_access = true

}

# Cloud Router

resource "google_compute_router" "main" {

  name    = "${var.app_name}-router"

  region  = var.region

  network = google_compute_network.main.id

  project = var.project_id

}

# Cloud NAT — lets private GKE nodes reach the internet

resource "google_compute_router_nat" "main" {

  name                               = "${var.app_name}-nat"

  router                             = google_compute_router.main.name

  region                             = var.region

  project                            = var.project_id

  nat_ip_allocate_option             = "AUTO_ONLY"

  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {

    enable = true

    filter = "ERRORS_ONLY"

  }

}

# Private IP range for Cloud SQL peering

resource "google_compute_global_address" "private_ip_range" {

  name          = "${var.app_name}-private-ip"

  purpose       = "VPC_PEERING"

  address_type  = "INTERNAL"

  prefix_length = 16

  network       = google_compute_network.main.id

  project       = var.project_id

}

# VPC peering so Cloud SQL is reachable privately from GKE

resource "google_service_networking_connection" "private_vpc_connection" {

  network                 = google_compute_network.main.id

  service                 = "servicenetworking.googleapis.com"

  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]

  depends_on = [google_compute_global_address.private_ip_range]

}
 