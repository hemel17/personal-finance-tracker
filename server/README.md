# Personal Finance Tracker - Backend API

A robust Node.js backend API for managing personal finances, featuring expense tracking, income management, budgeting, and financial analytics.

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

- **Email Notifications**
  - Automated alerts for budget thresholds
  - Transaction confirmation emails
  - Account verification and password reset emails

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
   npm install
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
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Profile

- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/update` - Update user profile

### Expenses

- `POST /api/expenses` - Create new expense
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get specific expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Income

- `POST /api/income` - Record new income
- `GET /api/income` - Get all income records
- `GET /api/income/:id` - Get specific income record
- `PUT /api/income/:id` - Update income record
- `DELETE /api/income/:id` - Delete income record

### Budgets

- `POST /api/budgets` - Create new budget
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get specific budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Analytics

- `GET /api/analytics/expenses` - Get expense analytics
- `GET /api/analytics/income` - Get income analytics
- `GET /api/analytics/budget` - Get budget analytics

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
