# SOCIAL-APP-SERVER

This file contains the code to a functional backend of a social web application that allows users to interact by sharing posts and messages

## TABLE OF CONTENTS

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contact Information](#contact-information)

## Installation

Run "npm i" to install all dependencies and libraries

## Usage

First thing to do is to signup using the route(http://localhost:5400/api/auth/signup)
and providing the neccessary information example :{
"firstName":"John",
"lastName": "Doe",
"email":"johndoe@gmail.com",
"profile":{
"userName":"john"
} ,
"phoneNumber": "23407889101",
"password":"9999999999"
}
after signing up an activation link will be sent in an email ,click on the link to activate your account then login using your username/email and password on the route(http://localhost:5400/api/auth/login)
after logging in you are able to do many things such as follow a profile,make a post comment and like a post,send messages,create groups and others

## Configuration

To run the code you would need the following

MONGO_URI=
PORT =
SMTP_HOST=
SMTP_PORT=
SMTP_MAIL=
SMTP_PASSWORD=
LIVE_CLIENT_URL=
JWT_PRIVATE_KEY =
NODE_ENV =
