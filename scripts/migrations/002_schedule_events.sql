-- Schedule events: replaces the hardcoded array that used to live in app/schedule/page.tsx
-- so the schedule can be edited from the admin dashboard, every year, without a code change.

CREATE TABLE IF NOT EXISTS schedule_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    event_type ENUM('gaming', 'music', 'talk', 'break', 'special') NOT NULL DEFAULT 'special',
    participants JSON NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_schedule_events_start (start_time),
    INDEX idx_schedule_events_active_order (is_active, display_order)
);
