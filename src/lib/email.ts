/**
 * Email Service Utility
 * Provides helper functions for sending emails via SendGrid
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

interface EmailTemplateOptions {
  to: string | string[];
  subject: string;
  data: Record<string, any>;
}

/**
 * Send a basic email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email sending failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

/**
 * Send a welcome email to new users
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Wavegroww! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Thank you for joining Wavegroww! We're excited to have you on board.</p>
            <p>With Wavegroww, you can:</p>
            <ul>
              <li>Manage WhatsApp conversations efficiently</li>
              <li>Automate customer responses</li>
              <li>Track analytics and insights</li>
              <li>Collaborate with your team</li>
            </ul>
            <p>Get started by exploring your dashboard:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.wavegroww.online'}/dashboard" class="button">Go to Dashboard</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Wavegroww. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Welcome to Wavegroww!',
    html,
  });
}

/**
 * Send a team invitation email
 */
export async function sendTeamInvitationEmail(
  inviteeEmail: string,
  inviterName: string,
  teamName: string,
  invitationLink: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You've Been Invited! 🎊</h1>
          </div>
          <div class="content">
            <h2>Team Invitation</h2>
            <p><strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong> on Wavegroww.</p>
            <p>Click the button below to accept the invitation and get started:</p>
            <a href="${invitationLink}" class="button">Accept Invitation</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              ${invitationLink}
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Wavegroww. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: inviteeEmail,
    subject: `You've been invited to join ${teamName} on Wavegroww`,
    html,
  });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  resetLink: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request 🔐</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              ${resetLink}
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Wavegroww. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Reset Your Wavegroww Password',
    html,
  });
}

/**
 * Send a notification email
 */
export async function sendNotificationEmail(
  userEmail: string,
  title: string,
  message: string,
  actionUrl?: string,
  actionText?: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p>${message}</p>
            ${actionUrl && actionText ? `<a href="${actionUrl}" class="button">${actionText}</a>` : ''}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Wavegroww. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: title,
    html,
  });
}

/**
 * Send an OTP verification email
 */
export async function sendOtpEmail(
  userEmail: string,
  otp: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea; background: #fff; padding: 15px 30px; border-radius: 5px; border: 1px dashed #667eea; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verification Code 🔐</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email</h2>
            <p>Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 10 minutes.</p>
            <div class="otp-code">\${otp}</div>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© \${new Date().getFullYear()} Wavegroww. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: 'Your Verification Code',
    html,
  });
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  userEmail: string,
  customerName: string,
  orderDetails: { id: string; amount: number; date: string }
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00B67A 0%, #009664 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #00B67A; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .order-details { background: white; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed! ✅</h1>
          </div>
          <div class="content">
            <h2>Hi ${customerName},</h2>
            <p>Thank you for your order! We have received it and are processing it.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${orderDetails.id}</p>
              <p><strong>Amount:</strong> ₹${orderDetails.amount}</p>
              <p><strong>Date:</strong> ${orderDetails.date}</p>
            </div>

            <p>We will notify you once it's shipped.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.wavegroww.online'}" class="button">View Order</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Wavegroww. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Order Confirmation #${orderDetails.id}`,
    html,
  });
}

/**
 * Send new order notification to seller
 */
export async function sendNewOrderNotification(
  sellerEmail: string,
  orderDetails: { id: string; amount: number; customerName: string }
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Received! 💰</h1>
          </div>
          <div class="content">
            <h2>You have a new order!</h2>
            <p><strong>Customer:</strong> ${orderDetails.customerName}</p>
            <p><strong>Amount:</strong> ₹${orderDetails.amount}</p>
            <p><strong>Order ID:</strong> ${orderDetails.id}</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.wavegroww.online'}/dashboard/orders" class="button">Manage Order</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Wavegroww. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: sellerEmail,
    subject: `New Order Received: #${orderDetails.id}`,
    html,
  });
}

/**
 * Send payment receipt for subscription
 */
export async function sendPaymentReceiptEmail(
  userEmail: string,
  paymentDetails: { amount: number; planName: string; date: string; invoiceId: string }
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .receipt { background: white; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt 🧾</h1>
          </div>
          <div class="content">
            <h2>Payment Successful!</h2>
            <p>Here is your receipt for your Wavegroww subscription.</p>
            
            <div class="receipt">
              <p><strong>Plan:</strong> ${paymentDetails.planName}</p>
              <p><strong>Amount:</strong> ₹${paymentDetails.amount}</p>
              <p><strong>Date:</strong> ${paymentDetails.date}</p>
              <p><strong>Invoice ID:</strong> ${paymentDetails.invoiceId}</p>
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.wavegroww.online'}/dashboard/billing" class="button">View Billing</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Wavegroww. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Payment Receipt - ${paymentDetails.invoiceId}`,
    html,
  });
}
