-- Create default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT IGNORE INTO admin_users (username, password_hash, email, role) VALUES 
('admin', '$2b$10$rQJ8YQZ9QZ9QZ9QZ9QZ9QOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'admin@dcterra.nl', 'super_admin');

-- Note: In production, you should change this password immediately
-- The actual hash will be generated when creating the admin user through the interface
