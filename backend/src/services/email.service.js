import transporter, { mailConfig } from '../config/mail.js';
import { generateBookingQrDataUrl } from '../utils/booking-qr.js';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDate = (value) => {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not provided';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatPrice = (value) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return 'Not provided';
  return `$${numberValue.toFixed(2)}`;
};

const formatVatIncluded = (totalPrice) => {
  const numberValue = Number(totalPrice);
  if (Number.isNaN(numberValue)) return null;
  return `-${formatPrice(numberValue * 0.13)}`;
};

const renderDetailRows = (rows = []) =>
  rows
    .filter((row) => row.value !== undefined && row.value !== null && row.value !== '')
    .map(
      (row) => `
        <tr>
          <td style="padding:8px 0; color:#6b6b6b; width:40%;">${escapeHtml(row.label)}</td>
          <td style="padding:8px 0; color:#2b2b2b; font-weight:600;">${escapeHtml(row.value)}</td>
        </tr>
      `
    )
    .join('');

const renderEmailTemplate = ({ preheader, title, subtitle, bodyHtml, footerNote }) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f3efe9;">
      <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${escapeHtml(preheader || '')}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3efe9; padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 12px 32px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:#1f4d4f; padding:26px 32px; color:#ffffff; font-family: 'Helvetica Neue', Arial, sans-serif;">
                  <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase;">The Trekkers Squad</div>
                  <div style="font-size:24px; font-weight:700; margin-top:6px;">${escapeHtml(title)}</div>
                  ${subtitle ? `<div style="font-size:14px; margin-top:6px; color:#e6f0ef;">${escapeHtml(subtitle)}</div>` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px; font-family:'Helvetica Neue', Arial, sans-serif; color:#2b2b2b; font-size:15px; line-height:1.7;">
                  ${bodyHtml}
                </td>
              </tr>
              <tr>
                <td style="background:#f8f4ee; padding:20px 32px; font-family:'Helvetica Neue', Arial, sans-serif; font-size:12px; color:#6b6b6b;">
                  <div>With gratitude,</div>
                  <div style="font-weight:600; color:#1f4d4f;">The Trekkers Squad Team</div>
                  ${footerNote ? `<div style="margin-top:8px;">${footerNote}</div>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const bookingStatusCopy = (status) => {
  switch (status) {
    case 'confirmed':
      return {
        title: 'Your booking is confirmed',
        subtitle: 'Your journey is officially on the calendar.',
        message:
          "Great news! Your booking has been confirmed. We’re excited to host you and will share next steps soon.",
      };
    case 'cancelled':
      return {
        title: 'Your booking was cancelled',
        subtitle: 'We are here if you need anything.',
        message:
          'Your booking has been cancelled. If this was unexpected or you need help, reply to this email and we will assist you.',
      };
    case 'completed':
      return {
        title: 'Your booking is complete',
        subtitle: 'Thank you for traveling with us.',
        message:
          'Your experience is complete. We hope it was unforgettable and would love to hear your feedback.',
      };
    case 'pending':
    default:
      return {
        title: 'Your booking is pending',
        subtitle: 'We are reviewing your request.',
        message:
          'Your booking is currently pending. Our team is reviewing the details and will confirm shortly.',
      };
  }
};

const paymentStatusCopy = (status) => {
  switch (status) {
    case 'paid':
      return {
        title: 'Payment received',
        subtitle: 'Thank you for your payment.',
        message:
          'We have received your payment. Your spot is secured and we will send further details soon.',
      };
    case 'partial':
      return {
        title: 'Partial payment received',
        subtitle: 'We have received a partial payment.',
        message:
          'Thanks! We have received a partial payment. You can complete the remaining balance at your convenience.',
      };
    case 'refunded':
      return {
        title: 'Payment refunded',
        subtitle: 'A refund has been processed.',
        message:
          'We have processed your refund. Please allow a few business days for it to appear in your account.',
      };
    case 'pending':
    default:
      return {
        title: 'Payment pending',
        subtitle: 'We are waiting on your payment.',
        message:
          'Your payment is currently pending. If you need assistance completing payment, reply to this email.',
      };
  }
};

/**
 * Send password reset email (same design as booking confirmation)
 */
export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const resetLink = resetUrl || `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `${mailConfig.from.name} <${mailConfig.from.address}>`,
    to: email,
    subject: 'Password Reset Request - The Trekkers Squad',
    html: renderEmailTemplate({
      preheader: 'Click the link below to set a new password for your The Trekkers Squad account.',
      title: 'Password reset request',
      subtitle: 'Set a new password for your account.',
      bodyHtml: `
        <p>You requested to reset your password for your The Trekkers Squad account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="margin:24px 0;">
          <a href="${resetLink}" style="display:inline-block; padding:14px 28px; background:#1f4d4f; color:#ffffff; text-decoration:none; border-radius:12px; font-weight:600; font-size:15px;">Reset Password</a>
        </div>
        <p style="color:#6b6b6b; font-size:14px;">Or copy and paste this link into your browser:</p>
        <div style="background:#f8f4ee; border:1px solid #eadfce; padding:12px 16px; border-radius:12px; margin:12px 0; word-break:break-all; font-size:13px; color:#2b2b2b;">
          <a href="${resetLink}" style="color:#1f4d4f; text-decoration:none;">${escapeHtml(resetLink)}</a>
        </div>
        <p><strong>This link will expire in 10 minutes.</strong></p>
        <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
      `,
      footerNote: 'This link expires in 10 minutes. Request a new one from the sign-in page if needed.',
    }),
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send contact form reply email
 */
export const sendContactReplyEmail = async (email, name, replyMessage) => {
  const mailOptions = {
    from: `${mailConfig.from.name} <${mailConfig.from.address}>`,
    to: email,
    subject: 'Re: Your inquiry to The Trekkers Squad',
    html: renderEmailTemplate({
      preheader: 'Thanks for reaching out. Here is our response.',
      title: 'Thanks for contacting The Trekkers Squad',
      subtitle: 'We are here to help.',
      bodyHtml: `
        <p>Hi ${escapeHtml(name || 'there')},</p>
        <p>Thank you for contacting The Trekkers Squad. Here is our response:</p>
        <div style="background:#f8f4ee; border:1px solid #eadfce; padding:16px; border-radius:12px; margin:20px 0; color:#2b2b2b;">
          ${escapeHtml(replyMessage || '').replace(/\n/g, '<br>')}
        </div>
        <p>If you have any further questions, please don't hesitate to reach out.</p>
      `,
      footerNote: 'Reply to this email if you need anything else.',
    }),
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = async (email, name, bookingDetails) => {
  const qrUrl = bookingDetails.qrUrl;
  let qrImage = null;
  if (qrUrl) {
    try {
      qrImage = await generateBookingQrDataUrl(qrUrl);
    } catch (error) {
      console.error('Error generating booking QR code:', error);
    }
  }

  const mailOptions = {
    from: `${mailConfig.from.name} <${mailConfig.from.address}>`,
    to: email,
    subject: "We've successfully received your booking - The Trekkers Squad",
    html: renderEmailTemplate({
      preheader: 'We have received your booking and will be in touch shortly.',
      title: 'Booking received',
      subtitle: 'Your adventure is on its way.',
      bodyHtml: `
        <p>Hi ${escapeHtml(name || 'there')},</p>
        <p>We have successfully received your booking. Our team will review the details and confirm the next steps soon.</p>
        <div style="background:#f8f4ee; border:1px solid #eadfce; padding:16px; border-radius:12px; margin:20px 0;">
          <div style="font-weight:600; margin-bottom:12px;">Booking details</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            ${renderDetailRows([
              { label: 'Trip', value: bookingDetails.tripTitle },
              { label: 'Departure date', value: formatDate(bookingDetails.departureDate) },
              { label: 'Participants', value: bookingDetails.numberOfParticipants },
              { label: 'Total price', value: formatPrice(bookingDetails.totalPrice) },
              { label: 'VAT (included, 13%)', value: formatVatIncluded(bookingDetails.totalPrice) },
              { label: 'Status', value: bookingDetails.status },
            ])}
          </table>
        </div>
        ${
          qrImage
            ? `<div style="text-align:center; margin:24px 0;">
                <div style="font-weight:600; margin-bottom:8px;">Verify your booking</div>
                <img src="${qrImage}" alt="Booking QR Code" width="180" height="180" style="display:block; margin:0 auto; border-radius:12px; border:1px solid #eadfce;" />
                ${qrUrl ? `<div style="margin-top:10px;"><a href="${qrUrl}" style="color:#1f4d4f; text-decoration:none;">Open confirmation page</a></div>` : ''}
              </div>`
            : ''
        }
        <p>If anything changes or you have special requests, reply to this email and we will take care of it.</p>
      `,
      footerNote: 'This inbox is monitored. Reach out anytime with questions.',
    }),
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send booking notification email to admin
 */
export const sendBookingAdminNotificationEmail = async (bookingDetails) => {
  const adminEmail =
    process.env.BOOKING_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || mailConfig.from.address;

  const mailOptions = {
		from: `${mailConfig.from.name} <${mailConfig.from.address}>`,
		to: adminEmail,
		subject: 'New Booking Created - The Trekkers Squad',
		html: renderEmailTemplate({
			preheader: 'A new booking was created in the system.',
			title: 'New booking created',
			subtitle: 'Review the details and follow up.',
			bodyHtml: `
        <p>A new booking has been created. Details are below.</p>
        <div style="background:#f8f4ee; border:1px solid #eadfce; padding:16px; border-radius:12px; margin:20px 0;">
          <div style="font-weight:600; margin-bottom:12px;">Guest details</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            ${renderDetailRows([
							{ label: 'Name', value: bookingDetails.guestName },
							{ label: 'Email', value: bookingDetails.guestEmail },
							{ label: 'Phone', value: bookingDetails.guestPhone },
						])}
          </table>
        </div>
        <div style="background:#f8f4ee; border:1px solid #eadfce; padding:16px; border-radius:12px; margin:20px 0;">
          <div style="font-weight:600; margin-bottom:12px;">Booking details</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            ${renderDetailRows([
							{ label: 'Trip', value: bookingDetails.tripTitle },
							{
								label: 'Departure date',
								value: formatDate(bookingDetails.departureDate),
							},
							{
								label: 'Participants',
								value: bookingDetails.numberOfParticipants,
							},
							{
								label: 'Total price',
								value: formatPrice(bookingDetails.totalPrice),
							},
							{
								label: 'VAT (included, 13%)',
								value: formatVatIncluded(bookingDetails.totalPrice),
							},
							{ label: 'Status', value: bookingDetails.status },
							{ label: 'Payment status', value: bookingDetails.paymentStatus },
						])}
          </table>
        </div>
        ${
					bookingDetails.specialRequests
						? `<div style="margin-top:12px;"><strong>Special requests:</strong><br>${escapeHtml(
								bookingDetails.specialRequests
						  ).replace(/\n/g, '<br>')}</div>`
						: ''
				}
        ${
					bookingDetails.notes
						? `<div style="margin-top:12px;"><strong>Notes:</strong><br>${escapeHtml(
								bookingDetails.notes
						  ).replace(/\n/g, '<br>')}</div>`
						: ''
				}
      `,
			footerNote: 'We have sent a confirmation receipt email to the sender.',
		}),
	};

  await transporter.sendMail(mailOptions);
};

/**
 * Send contact submission notification to admin
 */
export const sendContactSubmissionAdminEmail = async (submission) => {
  const adminEmail =
    process.env.CONTACT_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || mailConfig.from.address;

  const mailOptions = {
    from: `${mailConfig.from.name} <${mailConfig.from.address}>`,
    to: adminEmail,
    subject: 'New Contact Form Submission - The Trekkers Squad',
    html: renderEmailTemplate({
      preheader: 'A new contact form message has been received.',
      title: 'New contact submission',
      subtitle: 'Respond when ready.',
      bodyHtml: `
        <p>A new contact form submission has been received.</p>
        <div style="background:#f8f4ee; border:1px solid #eadfce; padding:16px; border-radius:12px; margin:20px 0;">
          <div style="font-weight:600; margin-bottom:12px;">Contact details</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            ${renderDetailRows([
              { label: 'Name', value: submission.name },
              { label: 'Email', value: submission.email },
              { label: 'Phone', value: submission.phone },
              { label: 'Subject', value: submission.subject },
              { label: 'Submitted', value: formatDate(submission.createdAt) },
            ])}
          </table>
        </div>
        <div style="background:#ffffff; border:1px solid #eadfce; padding:16px; border-radius:12px;">
          <div style="font-weight:600; margin-bottom:8px;">Message</div>
          <div style="white-space:pre-wrap; color:#2b2b2b;">${escapeHtml(submission.message)}</div>
        </div>
      `,
      footerNote: 'We have sent a confirmation receipt email to the sender.',
    }),
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send contact submission receipt to sender
 */
export const sendContactSubmissionReceiptEmail = async (submission) => {
  const mailOptions = {
    from: `${mailConfig.from.name} <${mailConfig.from.address}>`,
    to: submission.email,
    subject: "We've successfully received your message - The Trekkers Squad",
    html: renderEmailTemplate({
      preheader: 'Thanks for reaching out. We will respond soon.',
      title: 'Thanks for reaching out',
      subtitle: 'We have your message.',
      bodyHtml: `
        <p>Hi ${escapeHtml(submission.name || 'there')},</p>
        <p>We have successfully received your message. Our team will review it and get back to you shortly.</p>
        <div style="background:#f8f4ee; border:1px solid #eadfce; padding:16px; border-radius:12px; margin:20px 0;">
          <div style="font-weight:600; margin-bottom:8px;">Your message</div>
          <div style="white-space:pre-wrap; color:#2b2b2b;">${escapeHtml(submission.message)}</div>
        </div>
        <p>If you need to add anything else, just reply to this email.</p>
      `,
      footerNote: 'We typically respond within 1-2 business days.',
    }),
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send booking status update to guest
 */
export const sendBookingStatusUpdateEmail = async (email, name, bookingDetails) => {
  const copy = bookingStatusCopy(bookingDetails.status);

  const mailOptions = {
    from: `${mailConfig.from.name} <${mailConfig.from.address}>`,
    to: email,
    subject: `${copy.title} - The Trekkers Squad`,
    html: renderEmailTemplate({
      preheader: copy.subtitle,
      title: copy.title,
      subtitle: copy.subtitle,
      bodyHtml: `
        <p>Hi ${escapeHtml(name || 'there')},</p>
        <p>${escapeHtml(copy.message)}</p>
        <div style="background:#f8f4ee; border:1px solid #eadfce; padding:16px; border-radius:12px; margin:20px 0;">
          <div style="font-weight:600; margin-bottom:12px;">Booking details</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            ${renderDetailRows([
              { label: 'Trip', value: bookingDetails.tripTitle },
              { label: 'Departure date', value: formatDate(bookingDetails.departureDate) },
              { label: 'Participants', value: bookingDetails.numberOfParticipants },
              { label: 'Total price', value: formatPrice(bookingDetails.totalPrice) },
              { label: 'VAT (included, 13%)', value: formatVatIncluded(bookingDetails.totalPrice) },
              { label: 'Status', value: bookingDetails.status },
            ])}
          </table>
        </div>
        <p>If you have questions or need changes, reply to this email anytime.</p>
      `,
      footerNote: 'We are here to help with anything you need.',
    }),
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send payment status update to guest
 */
export const sendPaymentStatusUpdateEmail = async (email, name, bookingDetails) => {
  const copy = paymentStatusCopy(bookingDetails.paymentStatus);

  const mailOptions = {
    from: `${mailConfig.from.name} <${mailConfig.from.address}>`,
    to: email,
    subject: `${copy.title} - The Trekkers Squad`,
    html: renderEmailTemplate({
      preheader: copy.subtitle,
      title: copy.title,
      subtitle: copy.subtitle,
      bodyHtml: `
        <p>Hi ${escapeHtml(name || 'there')},</p>
        <p>${escapeHtml(copy.message)}</p>
        <div style="background:#f8f4ee; border:1px solid #eadfce; padding:16px; border-radius:12px; margin:20px 0;">
          <div style="font-weight:600; margin-bottom:12px;">Booking details</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            ${renderDetailRows([
              { label: 'Trip', value: bookingDetails.tripTitle },
              { label: 'Departure date', value: formatDate(bookingDetails.departureDate) },
              { label: 'Participants', value: bookingDetails.numberOfParticipants },
              { label: 'Total price', value: formatPrice(bookingDetails.totalPrice) },
              { label: 'VAT (included, 13%)', value: formatVatIncluded(bookingDetails.totalPrice) },
              { label: 'Payment status', value: bookingDetails.paymentStatus },
            ])}
          </table>
        </div>
        <p>If you need help with payment, just reply and we will assist you.</p>
      `,
      footerNote: 'Thank you for traveling with The Trekkers Squad.',
    }),
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send admin notification email
 */
export const sendAdminNotification = async (subject, message) => {
  const adminEmail = process.env.ADMIN_EMAIL || mailConfig.from.address;

  const mailOptions = {
    from: `${mailConfig.from.name} <${mailConfig.from.address}>`,
    to: adminEmail,
    subject: `[The Trekkers Squad] ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${subject}</h2>
            <div>${message.replace(/\n/g, '<br>')}</div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
