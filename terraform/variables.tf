variable "image_tag" {
  type        = string
  description = "Tag obrazu Docker używany w ECS task definition"
}

variable "ecs_cluster" {
  type        = string
  description = "Nazwa klastra ECS, na którym działa serwis"
}

variable "ecs_service" {
  type        = string
  description = "Nazwa ECS serwisu do aktualizacji"
}