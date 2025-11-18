provider "aws" {
  region = "eu-north-1"
}

resource "aws_ecs_cluster" "tf_forum" {
  name = var.ecs_cluster
}
