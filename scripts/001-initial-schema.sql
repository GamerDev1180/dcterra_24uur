-- Create database schema for 24H Livestream Event Registration
-- DCTerra   Event

-- Users table for student registrations
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    on_camera BOOLEAN NOT NULL DEFAULT FALSE,
    discord_code VARCHAR(50) UNIQUE NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Allowed email domains table
CREATE TABLE IF NOT EXISTS allowed_domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default allowed domains
INSERT IGNORE INTO allowed_domains (domain) VALUES 
('@dcterra.nl'),
('@student.dcterra.nl');

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Questions table for dynamic form questions
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type ENUM('text', 'textarea', 'select', 'radio', 'checkbox') NOT NULL,
    options JSON NULL, -- For select, radio, checkbox options
    required BOOLEAN DEFAULT TRUE,
    category ENUM('on_camera', 'off_camera') NOT NULL,
    order_index INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User answers table
CREATE TABLE IF NOT EXISTS user_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_question (user_id, question_id)
);

-- Insert default questions
INSERT IGNORE INTO questions (question_text, question_type, category, order_index, required) VALUES
-- On Camera Questions
('What is your experience with being on camera?', 'select', 'on_camera', 1, true),
('Are you comfortable speaking in front of an audience?', 'radio', 'on_camera', 2, true),
('What topics would you like to discuss during the livestream?', 'textarea', 'on_camera', 3, true),
('Do you have any streaming equipment (microphone, camera, etc.)?', 'checkbox', 'on_camera', 4, false),

-- Off Camera Questions
('How would you like to contribute to the event?', 'select', 'off_camera', 1, true),
('What technical skills do you have?', 'checkbox', 'off_camera', 2, false),
('Are you interested in helping with event moderation?', 'radio', 'off_camera', 3, true),
('What time slots are you available during the 24H event?', 'textarea', 'off_camera', 4, true);

-- Update questions with options
UPDATE questions SET options = JSON_ARRAY('Beginner', 'Intermediate', 'Advanced', 'Professional') 
WHERE question_text = 'What is your experience with being on camera?';

UPDATE questions SET options = JSON_ARRAY('Yes, very comfortable', 'Somewhat comfortable', 'Not very comfortable', 'Prefer not to speak') 
WHERE question_text = 'Are you comfortable speaking in front of an audience?';

UPDATE questions SET options = JSON_ARRAY('Microphone', 'HD Camera', 'Lighting Equipment', 'Streaming Software', 'None of the above') 
WHERE question_text = 'Do you have any streaming equipment (microphone, camera, etc.)?';

UPDATE questions SET options = JSON_ARRAY('Technical Support', 'Content Creation', 'Social Media', 'Event Coordination', 'Other') 
WHERE question_text = 'How would you like to contribute to the event?';

UPDATE questions SET options = JSON_ARRAY('Web Development', 'Graphic Design', 'Video Editing', 'Social Media Management', 'Project Management', 'Other') 
WHERE question_text = 'What technical skills do you have?';

UPDATE questions SET options = JSON_ARRAY('Yes, I would love to help', 'Maybe, depending on the time', 'No, I prefer other tasks') 
WHERE question_text = 'Are you interested in helping with event moderation?';
