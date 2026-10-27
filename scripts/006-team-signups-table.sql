-- Create team_signups table for volunteer & organization applications
CREATE TABLE IF NOT EXISTS team_signups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('vrijwilliger', 'organisatie') NOT NULL,
  name VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  discord_naam VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
