provider "aws" {
  region = "eu-north-1"
}

resource "aws_ecs_cluster" "tf_forum" {
  name = var.ecs_cluster
}

terraform {
  backend "s3" {
    # nie musisz tu podawać wartości, jeśli konfigurowane są w CLI przez -backend-config
  }
}