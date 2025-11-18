data "aws_security_group" "tf_alb_sg" {
  id = "sg-06493df4ee67ace66"
}

data "aws_security_group" "tf_backend_sg" {
  id = "sg-0a8fce5334efe103e"
}

data "aws_security_group" "tf_frontend_sg" {
  id = "sg-0161952e5f3bd7ca5"
}

data "aws_security_group" "tf_rds_sg" {
  id = "sg-04bbf2476af4e24d7"
}
