data "aws_lb" "tf_alb" {
  arn = "arn:aws:elasticloadbalancing:eu-north-1:380244861394:loadbalancer/app/F-LB/479ff7a8e5b01c67"
}

data "aws_lb_target_group" "tf_backend_tg" {
  arn = "arn:aws:elasticloadbalancing:eu-north-1:380244861394:targetgroup/F-TG-BACKEND/8dced510c46c07c5"
}

data "aws_lb_target_group" "tf_frontend_tg" {
  arn = "arn:aws:elasticloadbalancing:eu-north-1:380244861394:targetgroup/F-TG-FRONT/e15bc120fc772601"
}

data "aws_lb_listener" "tf_listener_http" {
  arn = "arn:aws:elasticloadbalancing:eu-north-1:380244861394:listener/app/F-LB/479ff7a8e5b01c67/545019ce34a23b60"
}

data "aws_lb_listener" "tf_listener_https" {
  arn = "arn:aws:elasticloadbalancing:eu-north-1:380244861394:listener/app/F-LB/479ff7a8e5b01c67/613a9e3ed71c0299"
}

data "aws_iam_role" "tf_task_role" {
  name = "task-forum-frontend" 
}
