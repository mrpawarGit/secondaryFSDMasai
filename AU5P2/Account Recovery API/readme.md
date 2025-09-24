# Secure Account Recovery API

## The backend API for a secure account recovery feature.

---

## Technology Stack

- Framework: Node.js with Express.js
- Database: MongoDB with Mongoose
- Authentication: jsonwebtoken for login and bcryptjs for password hashing
- Email validation: validator.js for email validation

---

### Part 1: Basic User Authentication API (Completed)

- User Model

  - Mongoose schema for your User.
  - email: String, required, unique, valid email format.
  - password: String, required.
  - passwordResetToken: String.
  - passwordResetExpires: Date.

- Standard Auth Routes
  - POST /api/auth/register: Creates a new user. The password must be hashed using bcryptjs before saving.
  - POST /api/auth/login: Authenticates a user with their email and password, returning a JWT upon success.
