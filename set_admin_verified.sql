UPDATE users SET email_verified = true WHERE role = 'ADMIN';
SELECT email, role, email_verified FROM users WHERE role = 'ADMIN';
