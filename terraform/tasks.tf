resource "aws_ecs_task_definition" "tf_forum_backend" {
  family                   = "tf-forum-backend"
  cpu                      = "1024"
  memory                   = "3072"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = "arn:aws:iam::380244861394:role/task-forum-frontend"
  task_role_arn            = "arn:aws:iam::380244861394:role/task-forum-frontend"

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture       = "X86_64"
  }
  
  container_definitions = jsonencode([
    {
      name      = "tf-forum-backend"
      image     = "380244861394.dkr.ecr.eu-north-1.amazonaws.com/tf/forum/backend:${var.image_tag}"
      cpu       = 0
      memory    = null
      essential = true
      portMappings = [
        {
          containerPort = 3333
          hostPort      = 3333
          protocol      = "tcp"
          appProtocol   = "http"
          name          = "forum-backend"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/forum-backend"
          "awslogs-create-group"  = "true"
          "awslogs-region"        = "eu-north-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}