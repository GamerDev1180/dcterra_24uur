-- Create sponsors table for dynamic sponsor management
CREATE TABLE IF NOT EXISTS sponsors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tier ENUM('Platinum', 'Gold', 'Silver', 'Bronze') NOT NULL,
  logo_url VARCHAR(500),
  description TEXT,
  website VARCHAR(500),
  contribution VARCHAR(255),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default sponsors
INSERT INTO sponsors (name, tier, logo_url, description, website, contribution, display_order) VALUES
('TechCorp Solutions', 'Platinum', '/tech-company-logo.jpg', 'Leading technology solutions provider supporting our streaming infrastructure', 'https://techcorp.example.com', 'Streaming Equipment & Technical Support', 1),
('Local Coffee Roasters', 'Gold', '/coffee-company-logo.jpg', 'Keeping our participants energized throughout the 24-hour event', 'https://coffeeroasters.example.com', 'Coffee & Refreshments', 2),
('Digital Marketing Pro', 'Gold', '/marketing-agency-logo.png', 'Helping us reach more people and maximize our impact', 'https://digitalmarketing.example.com', 'Marketing & Promotion', 3),
('Student Union', 'Silver', '/student-union-logo.jpg', 'Supporting student participation and campus coordination', 'https://studentunion.example.com', 'Venue & Student Support', 4),
('Local Pizza Place', 'Silver', '/pizza-restaurant-logo.png', 'Providing meals for our hardworking participants', 'https://pizzaplace.example.com', 'Food & Catering', 5);
