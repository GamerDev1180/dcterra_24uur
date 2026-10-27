-- Archive tables for the admin "reset for next year" action: registrations and
-- team signups get copied here (never overwritten -- archived_at is unique per
-- copy) before the live tables are cleared, so nothing is ever destroyed.

CREATE TABLE IF NOT EXISTS users_archive (
    id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    on_camera BOOLEAN NOT NULL,
    discord_code VARCHAR(50) NOT NULL,
    registration_date TIMESTAMP NULL,
    status ENUM('pending', 'confirmed', 'cancelled') NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    archived_year INT NOT NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, archived_at)
);

CREATE TABLE IF NOT EXISTS user_answers_archive (
    id INT NOT NULL,
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP NULL,
    archived_year INT NOT NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, archived_at)
);

CREATE TABLE IF NOT EXISTS team_signups_archive (
    id INT NOT NULL,
    type ENUM('vrijwilliger', 'organisatie') NOT NULL,
    name VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    status ENUM('pending', 'approved', 'rejected') NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    archived_year INT NOT NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, archived_at)
);
