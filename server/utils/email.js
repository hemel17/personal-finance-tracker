import { config } from "dotenv";
config({ path: "./.env" });
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  // host: process.env.SMTP_HOST,
  service: process.env.SMTP_SERVICE,
  // port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};

export const emailTemplates = {
  verifyEmail: (token) => ({
    subject: "Verify Your Email - Personal Finance Tracker",
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${process.env.CLIENT_URL}/verify-email?token=${token}">Verify Email</a>
    `,
  }),

  resetPassword: (token) => ({
    subject: "Reset Your Password - Personal Finance Tracker",
    html: `
      <h1>Password Reset Request</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${process.env.CLIENT_URL}/reset-password?token=${token}">Reset Password</a>
    `,
  }),

  expenseCreated: (expense) => ({
    subject: "New Expense Recorded",
    html: `
      <h1>New Expense Added</h1>
      <p>Amount: $${expense.amount}</p>
      <p>Category: ${expense.category}</p>
      <p>Description: ${expense.description}</p>
      <p>Date: ${expense.date.toLocaleDateString()}</p>
    `,
  }),

  incomeRecorded: (income) => ({
    subject: "New Income Recorded",
    html: `
      <h1>New Income Added</h1>
      <p>Amount: $${income.amount}</p>
      <p>Source: ${income.source}</p>
      <p>Date: ${income.date.toLocaleDateString()}</p>
    `,
  }),

  budgetAlert: (budget, percentage) => ({
    subject: `Budget Alert: ${percentage}% of ${budget.category} Budget Reached`,
    html: `
      <h1>Budget Alert</h1>
      <p>Your spending in ${budget.category} has reached ${percentage}% of your monthly budget.</p>
      <p>Current Spending: $${budget.currentSpending}</p>
      <p>Budget Amount: $${budget.amount}</p>
    `,
  }),
};
