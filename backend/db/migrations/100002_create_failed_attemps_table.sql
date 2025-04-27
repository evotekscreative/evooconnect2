DROP TABLE IF EXISTS failed_attempts CASCADE;

-- Create failed_attempts table if you haven't already
CREATE TABLE  failed_attempts (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    token VARCHAR(255),
    attempt_time TIMESTAMP NOT NULL
);

-- Add index for faster lookups
CREATE INDEX  idx_failed_attempts_ip_action 
ON failed_attempts(ip_address, action_type, attempt_time);