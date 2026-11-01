import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const mailConfig = {
  transporter,
  from: {
    name: process.env.SMTP_FROM_NAME || 'The Trekkers Squad',
    address: process.env.SMTP_FROM_EMAIL || process.env.GMAIL_USERNAME,
  },
};

export default transporter;

