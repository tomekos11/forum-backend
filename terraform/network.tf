data "aws_vpc" "tf_vpc" {
  id = "vpc-072a85a36437b72d1"
}

data "aws_subnet" "tf_public_1" {
  id = "subnet-03d4e69af54aaf8e9"
}

data "aws_subnet" "tf_public_2" {
  id = "subnet-025782eaa66e1b539"
}

data "aws_subnet" "tf_private_1" {
  id = "subnet-0f795a88cbfc61be3"
}

data "aws_subnet" "tf_private_2" {
  id = "subnet-04bc0e66b49b7f7d8"
}