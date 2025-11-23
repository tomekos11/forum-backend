resource "aws_ecs_service" "tf_forum_backend_service" {
  name            = var.ecs_service
  cluster         = var.ecs_cluster
  task_definition = aws_ecs_task_definition.tf_forum_backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  deployment_controller {
    type = "ECS"
  }
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent          = 200

  network_configuration {
    subnets         = [
      data.aws_subnet.tf_private_1.id,
      data.aws_subnet.tf_private_2.id
    ]
    security_groups = [data.aws_security_group.tf_backend_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = data.aws_lb_target_group.tf_backend_tg.arn
    container_name   = "forum-backend"
    container_port   = 3333
  }

  depends_on = [
    data.aws_lb_listener.tf_listener_https
  ]

  enable_ecs_managed_tags = true
  propagate_tags          = "SERVICE"
}