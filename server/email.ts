import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: "contact@leedacademya.com",
        pass: "Hb8@cX7+?y",
    },
});

export async function sendVerificationEmail(email: string, token: string) {
    // Get base URL from current environment
    const getBaseUrl = () => {
        // Check if we're in a browser environment (client-side)
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }

        // Server environment - use environment variables that are commonly available
        if (process.env.NODE_ENV === 'production') {
            // In production, use the actual domain where your app is hosted
            // You can set this as an environment variable or it might be auto-detected
            return process.env.BASE_URL || `https://leedacademya.com`;
        }

        // Default to localhost for development
        return 'http://localhost:5000';
    };

    const baseUrl = getBaseUrl();
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    const mailOptions = {
        from: '"Leed Academy" <contact@leedacademya.com>',
        to: email,
        subject: "Verify your email address",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Leed Academy!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <p>Click the button below to verify your email:</p>
        <a href="${verificationLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Verify Email</a>
        <p style="margin-top: 20px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending verification email:", error);
        return false;
    }
}

export async function sendContactEmail(name: string, userEmail: string, message: string) {
    const mailOptions = {
        from: '"Leed Academy Contact Form" <contact@leedacademya.com>',
        to: "contact@leedacademya.com", // Your email where you want to receive messages
        replyTo: userEmail, // User's email so you can reply directly
        subject: `New Contact Form Message from ${name}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">New Contact Form Submission</h2>
        
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>From:</strong> ${name}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Message:</strong></p>
          <p style="margin: 10px 0; white-space: pre-wrap;">${message}</p>
        </div>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
        
        <p style="color: #6c757d; font-size: 12px; margin: 10px 0;">
          This email was sent from the Leed Academy contact form.
        </p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Contact email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending contact email:", error);
        return false;
    }
}