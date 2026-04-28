# Email Setup Guide

This guide will help you set up email functionality for StockAI using Gmail.

## Prerequisites

- Gmail account: `stocky.entreprise@gmail.com`
- Access to the Gmail account settings

## Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with `stocky.entreprise@gmail.com`
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the prompts to enable 2-Step Verification

## Step 2: Generate App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Sign in if prompted
3. In the "Select app" dropdown, choose "Mail"
4. In the "Select device" dropdown, choose "Other (Custom name)"
5. Enter "StockAI Backend" as the name
6. Click "Generate"
7. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

## Step 3: Configure Environment Variable

1. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace `your_app_password_here` with the app password you generated:
   ```
   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
   ```
   **Note:** Remove any spaces from the app password

## Step 4: Rebuild and Restart Docker Containers

```bash
docker compose down
docker compose up -d --build java-api
```

## Step 5: Test Email Functionality

1. Go to the registration page: http://localhost:5173/auth/sign-up-3
2. Create a new account with a valid email address
3. Check the email inbox for the welcome email

## Email Features

When a user creates an account, they will receive a welcome email with:
- Personalized greeting with their name
- Overview of StockAI features
- Direct link to sign in
- Professional HTML formatting

## Troubleshooting

### Email not sending?

1. **Check app password**: Make sure you copied the entire 16-character password without spaces
2. **Check 2-Step Verification**: Ensure it's enabled on the Gmail account
3. **Check Docker logs**: 
   ```bash
   docker logs java_backend
   ```
4. **Check environment variable**:
   ```bash
   docker exec java_backend env | grep GMAIL
   ```

### Common errors:

- **"Authentication failed"**: App password is incorrect or 2-Step Verification is not enabled
- **"Connection timeout"**: Firewall or network issue blocking port 587
- **"Invalid credentials"**: The Gmail account credentials are incorrect

## Security Notes

- Never commit the `.env` file to version control (it's already in `.gitignore`)
- The app password is specific to this application and can be revoked at any time
- If compromised, revoke the app password and generate a new one

## Email Configuration Details

- **SMTP Host**: smtp.gmail.com
- **SMTP Port**: 587 (TLS)
- **From Address**: stocky.entreprise@gmail.com
- **Authentication**: Required
- **TLS**: Required
