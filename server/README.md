# Personal Finance Tracker - Backend API

A robust Node.js backend API for managing personal finances, featuring expense tracking, income management, and budgeting.

## Features

- **User Authentication & Authorization**

  - Secure email-based registration and login
  - Password reset functionality
  - Email verification system

- **Expense Management**

  - Track expenses across multiple categories
  - Record payment methods and descriptions
  - Categorize expenses for better organization

- **Income Tracking**

  - Record income from various sources (Salary, Freelance, Investments)
  - Multiple payment method support
  - Detailed income history

- **Budget Management**

  - Set monthly budgets by category
  - Track spending against budgets
  - Receive notifications at 80% and 100% budget thresholds

- **Goals Management**

  - Set and track financial savings goals
  - Monitor progress towards targets
  - Manage multiple goal categories
  - Receive goal achievement notifications

- **Email Notifications**
  - Automated alerts for budget thresholds
  - Transaction confirmation emails
  - Account verification and password reset emails
  - Goal progress and achievement notifications

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Email Service**: Nodemailer
- **Input Validation**: Zod
- **Security**: bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or cloud)
- SMTP email service credentials

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Create a `.env` file in the root directory with the following variables:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Connection
   MONGODB_URI=your_mongodb_connection_string

   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d

   # Email Configuration
   SMTP_SERVICE=gmail
   SMTP_MAIL=your_email@gmail.com
   SMTP_PASSWORD=your_app_specific_password

   # Client URL (for email verification links)
   CLIENT_URL=http://localhost:3000
   ```

## Running the Application

### Development Mode

```bash
yarn dev
```

### Production Mode

```bash
yarn start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/logout` - User logout (requires authentication)

### User Profile

- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/update` - Update user profile

### Expenses

- `POST /api/expense/add` - Create new expense
- `GET /api/expense/all` - Get all expenses
- `GET /api/expense/:id` - Get specific expense
- `PATCH /api/expense/update/:id` - Update expense
- `DELETE /api/expense/delete/:id` - Delete expense

### Income

- `POST /api/income/add` - Record new income
- `GET /api/income/all` - Get all income records
- `GET /api/income/:id` - Get specific income record
- `PATCH /api/income/update/:id` - Update income record
- `DELETE /api/income/delete/:id` - Delete income record

### Budgets

- `POST /api/budget/add` - Create new budget
- `GET /api/budget/all` - Get all budgets
- `GET /api/budget/:category` - Get specific budget by category
- `PATCH /api/budget/:category` - Update budget
- `DELETE /api/budget/:category` - Delete budget

## Data Models

### Budget Model

```javascript
{
  user: ObjectId,
  category: enum["Food", "Transport", "Entertainment", "Bills", "Healthcare", "Shopping", "Other"],
  amount: Number,
  month: Date,
  currentSpending: Number,
  notifications: {
    eightyPercent: Boolean,
    hundredPercent: Boolean
  }
}
```

### Income Model

```javascript
{
  user: ObjectId,
  amount: Number,
  source: enum["Salary", "Freelance", "Investments", "Other"],
  date: Date,
  paymentMethod: enum["Bank", "Cash", "Credit Card"],
  description: String
}
```

## Security Features

- Password hashing using bcryptjs
- JWT-based authentication
- Input validation and sanitization
- Protected routes with middleware authentication
- Secure email notifications

## Error Handling

The API implements a consistent error handling pattern with appropriate HTTP status codes and error messages.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
