-- Copy password from admin2 to admin@stockai.com
UPDATE users 
SET password = (SELECT password FROM users WHERE email = 'admin2@stockai.com')
WHERE email = 'admin@stockai.com';

-- Verify
SELECT email, role, email_verified, substring(password, 1, 20) as pwd_check 
FROM users 
WHERE email IN ('admin@stockai.com', 'admin2@stockai.com')
ORDER BY email;
