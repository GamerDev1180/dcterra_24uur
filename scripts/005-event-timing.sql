-- Add event timing configuration table
CREATE TABLE IF NOT EXISTS event_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default event timing configuration
INSERT IGNORE INTO event_config (config_key, config_value, description) VALUES
('stream_start_time', '2025-03-15 10:00:00', 'When the 24H livestream starts'),
('registration_end_time', '2025-03-14 23:59:59', 'When registration closes'),
('event_title', '24H Livestream for DCTerra  ', 'Main event title'),
('event_description', 'Join us for a 24-hour livestream event supporting DCTerra  ', 'Event description'),
('registration_open', 'true', 'Whether registration is currently open');
