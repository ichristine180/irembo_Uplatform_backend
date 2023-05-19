# user management system backend

## Built With
- Node.js
- Express.js
- PostgreSQL
- Sequelize
- Redis


## Getting Started
To get a local copy up and running, follow these simple steps:

1. Clone this repo: `https://github.com/ichristine180/irembo_Uplatform_backend.git`
2. Navigate into the project directory.
3. Create a file called `.env` and copy the variables from `.env-template`. Initialize all the environment variables.
4. Install Redis on your system by following the official Redis installation instructions for your operating system. Visit the Redis website at: https://redis.io/
5. Run `npm install` or `yarn install` to install all the required packages.
6. If the packages are installed successfully, run `node dbSync.js` to create all the tables.
7. Start the Redis server.
8. Finally, run `npm start` to start the server.

## Usage
You can now use any API development tool like Postman to test the endpoints.

NOTE: The server will be running on port 3000 if you didn't specify it in the `.env` file as mentioned above.

Make sure to have Redis installed and running before starting the server. Redis is used for caching or other purposes in this project, and it's required for proper functionality.

## Endpoints

- `POST /signup`
  - Description: Endpoint for user signup.
  - Controller: `signup`

- `POST /upload`
  - Description: Endpoint for uploading an image.
  - Middleware: `isAuthenticated`, `uploadImage`
  - Controller: `saveImage`

- `POST /info`
  - Description: Endpoint for getting user information by account ID.
  - Middleware: `isAuthenticated`
  - Controller: `getUserInfoByAccountId`

- `POST /verification`
  - Description: Endpoint for requesting account verification.
  - Middleware: `isAuthenticated`
  - Controller: `requestVerifyAccount`

- `POST /verification/feedback`
  - Description: Endpoint for providing verification feedback.
  - Controller: `verificationFeedback`

- `POST /login`
  - Description: Endpoint for user login.
  - Controller: `login`

- `POST /verify`
  - Description: Endpoint for verifying a code.
  - Controller: `verifyCode`

- `POST /login/send`
  - Description: Endpoint for sending a login link.
  - Controller: `sendLoginLink`

- `POST /login/link`
  - Description: Endpoint for login support link.
  - Controller: `loginSupportLink`

- `POST /logout`
  - Description: Endpoint for user logout.
  - Middleware: `isAuthenticated`
  - Controller: `logout`

- `POST /password/reset`
  - Description: Endpoint for sending a reset password link.
  - Controller: `sendResetPasswordLink`

- `POST /resetPassword`
  - Description: Endpoint for resetting a password.
  - Controller: `resetPassword`

## Usage

To access these endpoints, make HTTP requests to the corresponding URL paths using the specified HTTP methods.

Please note that some endpoints require authentication, indicated by the `isAuthenticated` middleware.

## Examples
- User signup:
  - Method: `POST`
  - URL: `/signup`
  - Request Body: { username, email, password }
  - Response: Success message or error message

- Upload image:
  - Method: `POST`
  - URL: `/upload`
  - Request Body: Form data with `file` field containing the image file
  - Response: Image upload success message or error message

- Get user information by account ID:
  - Method: `POST`
  - URL: `/info`
  - Request Body: None (Authentication token included in headers)
  - Response: User information object or error message

- Request account verification:
  - Method: `POST`
  - URL: `/verification`
  - Request Body: None (Authentication token included in headers)
  - Response: Verification request success message or error message

- Provide verification feedback:
  - Method: `POST`
  - URL: `/verification/feedback`
  - Request Body: { feedback }
  - Response: Feedback submission success message or error message
- User login:
  - Method: `POST`
  - URL: `/login`
  - Request Body: { mobile_no, password }
  - Response: receive otp on provided mobile

- Verify code:
  - Method: `POST`
  - URL: `/verify`
  - Request Body: { code }
  - Response: Verification success or failure message

- Send login link:
  - Method: `POST`
  - URL: `/login/send`
  - Request Body: { mobile_no }
  - Response: Success message or error message

- Login support link:
  - Method: `POST`
  - URL: `/login/link`
  - Request Body: { mobile_no }
  - Response: Support link success message or error message

- User logout:
  - Method: `POST`
  - URL: `/logout`
  - Request Body: None
  - Response: Logout success message

- Send reset password link:
  - Method: `POST`
  - URL: `/password/reset`
  - Request Body: { mobile_no }
  - Response: Reset password link success message or error message

- Reset password:
  - Method: `POST`
  - URL: `/resetPassword`
  - Request Body: { old_password, newPassword }
  - Response: Password reset success message or error message

