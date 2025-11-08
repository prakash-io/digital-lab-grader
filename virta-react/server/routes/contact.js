import express from "express";
import nodemailer from "nodemailer";
import { z } from "zod";

const router = express.Router();

// Contact form schema validation
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

// Create transporter for sending emails
// Using Gmail SMTP - configure with environment variables
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️  Email credentials not configured. Contact form emails will not be sent.");
    console.warn("   Set EMAIL_USER and EMAIL_PASS environment variables to enable email sending.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Contact form submission endpoint
router.post("/", async (req, res) => {
  try {
    // Validate request body
    const validationResult = contactSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors,
      });
    }

    const { name, email, message } = validationResult.data;

    // Create transporter
    const transporter = createTransporter();
    
    if (!transporter) {
      // If email is not configured, still return success but log the message
      console.log("📧 Contact form submission (email not configured):");
      console.log(`   From: ${name} (${email})`);
      console.log(`   Message: ${message}`);
      
      return res.status(200).json({
        success: true,
        message: "Thank you for your message! We'll get back to you soon.",
        note: "Email service not configured. Message logged to console.",
      });
    }

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "Prakash01022005@gmail.com",
      subject: `Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #a54bf4;">New Contact Form Submission</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
              ${message}
            </p>
          </div>
          <p style="color: #666; font-size: 12px;">
            This email was sent from the VirTA Contact Form.
          </p>
        </div>
      `,
      replyTo: email,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`✅ Contact form email sent from ${name} (${email})`);

    res.status(200).json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    
    // Handle specific nodemailer errors
    if (error.code === "EAUTH") {
      return res.status(500).json({
        success: false,
        message: "Email authentication failed. Please check email credentials.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: error.message,
    });
  }
});

export default router;

