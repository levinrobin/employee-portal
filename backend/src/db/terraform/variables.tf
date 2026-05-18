variable "project_id" {

  description = "GCP project ID"

  type        = string

  default     = "levin-495707"

}

variable "region" {

  description = "GCP region"

  type        = string

  default     = "us-central1"

}

variable "zone" {

  description = "GCP zone"

  type        = string

  default     = "us-central1-f"

}

variable "app_name" {

  description = "Application name used for resource naming"

  type        = string

  default     = "employee-portal"

}

variable "environment" {

  description = "Environment name"

  type        = string

  default     = "prod"

}

variable "gke_node_count" {

  description = "Number of nodes in GKE node pool"

  type        = number

  default     = 1

}

variable "gke_machine_type" {

  description = "Machine type for GKE nodes"

  type        = string

  default     = "e2-standard-2"

}

variable "db_tier" {

  description = "Cloud SQL instance tier"

  type        = string

  default     = "db-f1-micro"

}

variable "db_name" {

  description = "PostgreSQL database name"

  type        = string

  default     = "employee_portal"

}

variable "db_user" {

  description = "PostgreSQL database user"

  type        = string

  default     = "empuser"

}

variable "db_password" {

  description = "PostgreSQL password — pass via TF_VAR_db_password"

  type        = string

  sensitive   = true

}
 