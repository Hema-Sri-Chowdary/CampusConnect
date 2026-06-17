const transporter = require('../config/nodemailer');

/**
 * Send OTP verification email
 */
const sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - CampusConnect',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 26px; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
          .body { padding: 36px 30px; }
          .greeting { font-size: 18px; color: #1a1a2e; font-weight: 600; margin-bottom: 12px; }
          .text { color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
          .otp-box { background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%); border: 2px solid #6C63FF; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 42px; font-weight: 800; color: #6C63FF; letter-spacing: 8px; font-family: monospace; }
          .otp-label { color: #64748b; font-size: 13px; margin-top: 8px; }
          .expiry { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 8px; color: #856404; font-size: 13px; margin-bottom: 24px; }
          .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 CampusConnect</h1>
            <p>College Club Event Management Platform</p>
          </div>
          <div class="body">
            <div class="greeting">Hello, ${name}! 👋</div>
            <p class="text">Welcome to CampusConnect! To complete your registration, please verify your email address using the OTP below:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <div class="otp-label">One-Time Password</div>
            </div>
            <div class="expiry">⏰ This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</div>
            <p class="text">If you didn't create an account with CampusConnect, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 CampusConnect. Built for VIT AP | <a href="#" style="color: #6C63FF;">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send registration confirmation email
 */
const sendRegistrationConfirmEmail = async (email, name, eventTitle, registrationNumber, qrCodeBase64) => {
  const mailOptions = {
    from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Registration Confirmed - ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 26px; }
          .checkmark { font-size: 48px; display: block; margin-bottom: 12px; }
          .body { padding: 36px 30px; }
          .reg-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
          .reg-number { font-size: 22px; font-weight: 800; color: #059669; font-family: monospace; }
          .qr-section { text-align: center; margin: 24px 0; }
          .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="checkmark">✅</span>
            <h1>Registration Confirmed!</h1>
          </div>
          <div class="body">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your registration for <strong>${eventTitle}</strong> has been confirmed!</p>
            <div class="reg-box">
              <div style="color: #64748b; font-size: 13px; margin-bottom: 8px;">Registration Number</div>
              <div class="reg-number">${registrationNumber}</div>
            </div>
            ${qrCodeBase64 ? `<div class="qr-section"><p style="color: #64748b; font-size: 13px;">Show this QR code at the venue for check-in:</p><img src="${qrCodeBase64}" alt="QR Code" style="width: 160px; height: 160px; border: 2px solid #e2e8f0; border-radius: 8px;" /></div>` : ''}
            <p style="color: #64748b; font-size: 14px;">Please carry your registration ID and a valid college ID to the event. See you there! 🎉</p>
          </div>
          <div class="footer">
            <p>© 2024 CampusConnect</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send payment success email
 */
const sendPaymentSuccessEmail = async (email, name, eventTitle, amount, paymentId) => {
  const mailOptions = {
    from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Payment Successful - ${eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%); padding: 40px 30px; text-align: center; color: white; }
          .body { padding: 36px 30px; }
          .amount { font-size: 36px; font-weight: 800; color: #6C63FF; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
          .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size:48px">💳</div>
            <h1>Payment Successful!</h1>
          </div>
          <div class="body">
            <p>Hi <strong>${name}</strong>, your payment has been received!</p>
            <p style="text-align:center" class="amount">₹${amount}</p>
            <div class="detail-row"><span style="color:#64748b">Event</span><strong>${eventTitle}</strong></div>
            <div class="detail-row"><span style="color:#64748b">Payment ID</span><strong style="font-family:monospace">${paymentId}</strong></div>
            <div class="detail-row"><span style="color:#64748b">Date</span><strong>${new Date().toLocaleDateString('en-IN')}</strong></div>
            <p style="margin-top:20px; color:#64748b; font-size:14px">Keep this email as your payment receipt. Your registration is now confirmed.</p>
          </div>
          <div class="footer"><p>© 2024 CampusConnect</p></div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send event reminder email
 */
const sendEventReminderEmail = async (email, name, eventTitle, eventDate, venue) => {
  const mailOptions = {
    from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Reminder: ${eventTitle} is Tomorrow!`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 40px 20px;">
        <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; color: white;">
            <div style="font-size:48px">⏰</div>
            <h1 style="margin: 10px 0">Event Reminder</h1>
          </div>
          <div style="padding: 36px 30px;">
            <p>Hi <strong>${name}</strong>,</p>
            <p>This is a reminder that <strong>${eventTitle}</strong> is happening tomorrow!</p>
            <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <div>📅 <strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div style="margin-top: 8px;">📍 <strong>Venue:</strong> ${venue}</div>
            </div>
            <p style="color: #64748b; font-size: 14px;">Don't forget to bring your registration QR code and college ID. See you there! 🚀</p>
          </div>
          <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2024 CampusConnect</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"CampusConnect" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - CampusConnect',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 26px; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
          .body { padding: 36px 30px; }
          .greeting { font-size: 18px; color: #1a1a2e; font-weight: 600; margin-bottom: 12px; }
          .text { color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
          .otp-box { background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%); border: 2px solid #FF6B6B; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 42px; font-weight: 800; color: #FF6B6B; letter-spacing: 8px; font-family: monospace; }
          .expiry { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 8px; color: #856404; font-size: 13px; margin-bottom: 24px; }
          .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { color: #94a3b8; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 CampusConnect</h1>
            <p>Reset Your Password</p>
          </div>
          <div class="body">
            <div class="greeting">Hello, ${name}! 👋</div>
            <p class="text">We received a request to reset your password. Use the verification OTP below to complete the reset:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <div class="expiry">⏰ This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</div>
            <p class="text">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 CampusConnect</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOTPEmail,
  sendRegistrationConfirmEmail,
  sendPaymentSuccessEmail,
  sendEventReminderEmail,
  sendPasswordResetEmail
};
