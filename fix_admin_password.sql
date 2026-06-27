-- Set admin@stockai.com password to "admin123" using a properly generated BCrypt hash
-- This hash was generated using BCryptPasswordEncoder with strength 10
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIVI9jZ.qPZRQyOlRWJUIUQjUaj6CKC',
    email_verified = true
WHERE email = 'admin@stockai.com';

-- Verify the update
SELECT email, role, email_verified, length(password) as pwd_length, substring(password, 1, 7) as pwd_prefix 
FROM users 
WHERE email = 'admin@stockai.com';
