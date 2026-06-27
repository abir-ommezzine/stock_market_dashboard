-- BCrypt hash for "admin123"
UPDATE users SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMye/IVI9jZ.qPZRQyOlRWJUIUQjUaj6CKC' WHERE email = 'admin@stockai.com';
SELECT email, role, email_verified, substring(password, 1, 20) as pwd_check FROM users WHERE email = 'admin@stockai.com';
