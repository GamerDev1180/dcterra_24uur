-- Create a default admin user with a secure password
-- This script should be run after the initial setup

-- Generate a proper bcrypt hash for 'admin123' (cost factor 12)
-- In production, change this password immediately after first login

INSERT IGNORE INTO admin_users (username, password_hash, email, role) VALUES 
('admin_dcterra', '$2b$12$ENqxNXj3WwXXoxSrv5p5D.2U/FEJYelccp3XQAgybLl23/N7IOe7S', 'admin1@dcterra.nl', 'super_admin');

-- The password hash above corresponds to 'admin123'
-- To generate a new hash, use: bcrypt.hash('your_password', 12)
