````markdown
# SOCIAL-APP-SERVER

This repository contains the backend code for a social web application that allows users to interact by sharing posts and messages.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Contact Information](#contact-information)

## Installation

To set up the project, follow these steps:

1. Clone this repository.
2. Run `npm install` to install all dependencies and libraries.

## Usage

1. Sign up by making a POST request to `/api/auth/signup` with the following details in the request body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@gmail.com",
  "profile": {
    "userName": "john",
    "bio": "i love my work",
    "profileType": "private"
  },
  "phoneNumber": "23407889101",
  "password": "9999999999"
}
```
````

2. After signing up, an activation link will be sent to your email. Click on the link to activate your account.

3. Log in using your username/email and password with a POST request to `/api/auth/login`.

```json
{
  "email_or_userName": "dbook",
  "password": "1234567890"
}
```

After logging in, you'll have permission to access various features, including:

### View Your Profile

- **Method:** GET
- **Endpoint:** `/profile`
- **Access:** Private

### Follow a Profile/ Unfollow a profile

- **Method:** POST
- **Endpoint:** `/profile/follow`
- **Access:** Private
- **Request Body:**

```json
{
  "userName": "john"
}
```

### View Following

- **Method:** GET
- **Endpoint:** `/profile/following`
- **Access:** Private

### View Followers

- **Method:** GET
- **Endpoint:** `/profile/followers`
- **Access:** Private

### Find a Profile

- **Method:** POST
- **Endpoint:** `/profile/find`
- **Access:** Public
- **Request Body:**

```json
{
  "userName": "john"
}
```

### View Follow Requests (for accounts with profileType = private)

- **Method:** GET
- **Endpoint:** `/profile/follow-requests`
- **Access:** Private

### Manage Follow Requests (for accounts with profileType = private)

- **Method:** POST
- **Endpoint:** `/profile/follow-requests/action`
- **Access:** Private
- **Request Body:**

```json
{
  "username": "john",
  "action": "accept"
}
```

### Edit Profile

- **Method:** PUT
- **Endpoint:** `/profile/edit`
- **Access:** Private
  (put in the the name of the property you wish to change)

To change username, use the request body:

```json
{
  "userName": "john"
}
```

To change bio, use:

```json
{
  "bio": "this is my bio"
}
```

### Home Page

- **Method:** GET
- **Endpoint:** `/users/home`
- **Access:** Private

### Filter posts by topic ( Home Page)

- **Method:** POST
- **Endpoint:** `/users/home/search`
- **Access:** Private

```json
{
  "title": "math"
}
```

### Send message

- **Method:** POST
- **Endpoint:** `/message/:userId`
- **Access:** Private

```json
{
  "textMessage": "hello"
}
```

### Create group

- **Method:** POST
- **Endpoint:** `/message/create/group`
- **Access:** Private

```json
{
  "userNames": ["john", "alfred", "kevin"]
}
```

### Message group

- **Method:** POST
- **Endpoint:** `/message/:groupId/message`
- **Access:** Private

```json
{
  "textMessage": "hello group members"
}
```

### Make a post

- **Method:** POST
- **Endpoint:** `/api/post`
- **Access:** Private

```json
{
  "title": "education",
  "content": "testing new post schema"
}
```

### Like a post/unlike a post

- **Method:** PUT
- **Endpoint:** `/api/post/:postId/like`
- **Access:** Public

### Comment on a post

- **Method:** PUT
- **Endpoint:** `/api/post/:postId/comment`
- **Access:** Public

```json
{
  "message": "testing comment"
}
```

### Delete a post

- **Method:** DELETE
- **Endpoint:** `/api/post/:postId/delete`
- **Access:** Private

### Delete a comment

- **Method:** DELETE
- **Endpoint:** `/api/post/delete/:commentId`
- **Access:** Private

### Block a profile

- **Method:** PUT
- **Endpoint:** `/api/auth/block`
- **Access:** Private

```json

```

### Forgot password

- **Method:** POST
- **Endpoint:** `/api/auth/forgot-password`
- **Access:** Private

### Edit account

- **Method:** PUT
- **Endpoint:** `/api/auth/edit`
- **Access:** Private
  (provide the name of the property you wish to change along with your password)

```json
{
  "firstName": "Devin",
  "password": "1234567890"
}
```

### Log-out

- **Method:** DELETE
- **Endpoint:** `/api/auth/logout`
- **Access:** Private

### Delete account

- **Method:** DELETE
- **Endpoint:** `/api/auth/delete`
- **Access:** Private

## Configuration

To run the code, you need to configure the following environment variables:

- `MONGO_URI`
- `PORT`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_MAIL`
- `SMTP_PASSWORD`
- `LIVE_CLIENT_URL`
- `JWT_PRIVATE_KEY`
- `NODE_ENV`

## Error Handling

Errors are handled throughout the application. Specific error codes and messages are returned for different scenarios to assist developers integrating with the API.

## Contact Information

For questions or support, please contact [isiakaajibade581@gmail.com](mailto:isiakaajibade581@gmail.com).

```

```
