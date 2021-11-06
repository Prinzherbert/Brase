CREATE DATABASE if not exists tcctemp;
USE tcctemp;
create table postit(
  id int auto_increment,
  positionX float not null,
  positionY float not null,
  content varchar(255),
  primary key (id)
);