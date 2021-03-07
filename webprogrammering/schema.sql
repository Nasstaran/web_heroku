-- //schema.sql//
create table if not exists users(
  email varchar(40),
  password varchar(40),
  firstname varchar(40),
  lastname varchar(40),
  gender varchar(6),
  city varchar(40),
  country varchar(40),
  primary key(email)
);

create table if not exists signedinusers(
  token varchar(100),
  email varchar(100),
  primary key(email),
  foreign key(email) references users(email)
);

create table if not exists wall(
  fromEmail varchar(100),
  toEmail varchar(100),
  message text
);
