Q: 4
Problem Statement: Secure Account Recovery API
Core Objective
You are to build the backend API for a secure account recovery feature. This is a common and critical task in web development that tests your ability to handle multi-step logic, manage sensitive tokens, and integrate with third-party services like an email provider. You will build the user authentication basics and then implement the full "forgot password" and "reset password" flow.

Important Note on Scope: Due to the 2-hour time limit, this project focuses exclusively on the authentication and email flow. Topics like Redis Caching, Cron Jobs, and Mongoose Aggregations are considered out of scope.

Setup & Technology Stack
Framework: Node.js with Express.js.
Database: MongoDB with Mongoose.
Authentication: jsonwebtoken for login and bcryptjs for password hashing.
Email Integration: nodemailer for sending emails.
Architecture: You must follow the MVC (Model-View-Controller) pattern.
Email Testing: To avoid setting up a real email account, you must use a free developer email testing service. Ethereal.email is highly recommended as it requires no signup.
Link: https://ethereal.email/
Feature Requirements
The project is divided into two parts: setting up basic authentication and then implementing the password reset logic.

Part 1: Basic User Authentication API
User Model:
Create a Mongoose schema for your User. It must include:
email: String, required, unique, valid email format.
password: String, required.
passwordResetToken: String.
passwordResetExpires: Date.
Standard Auth Routes:
POST /api/auth/register: Creates a new user. The password must be hashed using bcryptjs before saving.
POST /api/auth/login: Authenticates a user with their email and password, returning a JWT upon success.
Part 2: The Password Reset Flow (Core Task)
This is a two-step process that requires two new endpoints.

Step A: "Forgot Password" Endpoint
Route: POST /api/auth/forgot-password
Logic:
The request body will contain the user's email.
Find the user in the database by that email. If no user, send a success response to prevent email enumeration.
Generate a secure, random reset token (the built-in crypto module is excellent for this).
Hash this token and save the hashed version to the passwordResetToken field on the user document.
Set an expiration time for the token (e.g., 10 minutes from now) and save it to the passwordResetExpires field.
Use nodemailer and your Ethereal.email credentials to send an email to the user. The email must contain a link with the un-hashed token, like: http://yourapp.com/reset-password/${resetToken}.
Log the Ethereal message URL to the console so you can easily open the email in your browser.
Step B: "Reset Password" Endpoint
Route: PATCH /api/auth/reset-password/:token
Logic:
Get the un-hashed token from the URL parameters (req.params.token).
Hash this incoming token so you can find the matching user in the database.
Find a user where the passwordResetToken matches the hashed token and the passwordResetExpires date is still in the future ($gt: Date.now()).
If no user is found or the token is expired, return a 400 Bad Request error.
If the token is valid, take the new password from the request body, hash it, and update the user's password field.
Clear the passwordResetToken and passwordResetExpires fields in the database.
Send a success response.
