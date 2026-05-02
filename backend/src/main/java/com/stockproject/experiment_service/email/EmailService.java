package com.stockproject.experiment_service.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendWelcomeEmail(String toEmail, String firstName, String lastName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("stocky.entreprise@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("Welcome to StockAI - Your Account is Ready!");

            String htmlContent = buildWelcomeEmailHtml(firstName, lastName, toEmail);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String firstName, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("stocky.entreprise@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("Reset Your StockAI Password");

            String htmlContent = buildPasswordResetEmailHtml(firstName, toEmail, resetToken);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    private String buildWelcomeEmailHtml(String firstName, String lastName, String toEmail) {
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<style>" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }" +
            ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }" +
            ".header h1 { margin: 0; font-size: 28px; }" +
            ".content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }" +
            ".button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }" +
            ".features { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }" +
            ".feature-item { margin: 10px 0; padding-left: 25px; position: relative; }" +
            ".feature-item:before { content: '✓'; position: absolute; left: 0; color: #667eea; font-weight: bold; }" +
            ".footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #e0e0e0; margin-top: 20px; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class=\"header\">" +
            "<h1>🚀 Welcome to StockAI!</h1>" +
            "</div>" +
            "<div class=\"content\">" +
            "<h2>Hello " + firstName + " " + lastName + ",</h2>" +
            "<p>Thank you for joining StockAI! We're excited to have you on board.</p>" +
            "<p>Your account has been successfully created and you can now access all our powerful stock prediction features.</p>" +
            "<div class=\"features\">" +
            "<h3>What you can do with StockAI:</h3>" +
            "<div class=\"feature-item\">Run advanced stock predictions using ARIMA, SARIMA, and ARMA models</div>" +
            "<div class=\"feature-item\">Create and manage your personalized watchlist</div>" +
            "<div class=\"feature-item\">Save and track your prediction history</div>" +
            "<div class=\"feature-item\">Analyze historical stock data with interactive charts</div>" +
            "<div class=\"feature-item\">Get AI-powered insights for better investment decisions</div>" +
            "</div>" +
            "<p style=\"text-align: center;\">" +
            "<a href=\"http://localhost:5173/auth/sign-in-3\" class=\"button\">Start Predicting Now</a>" +
            "</p>" +
            "<p>If you have any questions or need assistance, feel free to reach out to our support team.</p>" +
            "<p>Happy predicting!<br><strong>The StockAI Team</strong></p>" +
            "</div>" +
            "<div class=\"footer\">" +
            "<p>This email was sent to " + toEmail + "</p>" +
            "<p>© 2026 StockAI. All rights reserved.</p>" +
            "</div>" +
            "</body>" +
            "</html>";
    }

    private String buildPasswordResetEmailHtml(String firstName, String toEmail, String resetToken) {
        String resetLink = "http://localhost:5173/auth/reset-password?token=" + resetToken;
        
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "<meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<style>" +
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }" +
            ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }" +
            ".header h1 { margin: 0; font-size: 28px; }" +
            ".content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }" +
            ".button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }" +
            ".warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }" +
            ".footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #e0e0e0; margin-top: 20px; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class=\"header\">" +
            "<h1>🔐 Password Reset Request</h1>" +
            "</div>" +
            "<div class=\"content\">" +
            "<h2>Hello " + firstName + ",</h2>" +
            "<p>We received a request to reset your StockAI account password.</p>" +
            "<p>Click the button below to reset your password:</p>" +
            "<p style=\"text-align: center;\">" +
            "<a href=\"" + resetLink + "\" class=\"button\">Reset Password</a>" +
            "</p>" +
            "<div class=\"warning\">" +
            "<strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons." +
            "</div>" +
            "<p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>" +
            "<p>For security reasons, please do not share this email with anyone.</p>" +
            "<p>Best regards,<br><strong>The StockAI Team</strong></p>" +
            "</div>" +
            "<div class=\"footer\">" +
            "<p>This email was sent to " + toEmail + "</p>" +
            "<p>© 2026 StockAI. All rights reserved.</p>" +
            "</div>" +
            "</body>" +
            "</html>";
    }
}
