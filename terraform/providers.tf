terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0" # Specifies the major release version
    }
  }
}

provider "google" {
  project = "levin-495707"
  region  = "us-central1"
  zone    = "us-central1-a"
}
