-- SQLBook: Code
-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    username VARCHAR(100) UNIQUE,
    birthdate DATE NULL,
    gender VARCHAR(20) NULL,
    location VARCHAR(100) NULL,
    organization VARCHAR(100) NULL,
    website TEXT NULL,
    phone VARCHAR(20) NULL,
    headline TEXT NULL,
    about TEXT NULL,
    skills JSONB NULL,
    socials JSONB NULL,
    photo TEXT NULL,
    cover_image TEXT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) NULL,
    verification_expires TIMESTAMP NULL,
    reset_token VARCHAR(255) NULL,
    reset_expires TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL 
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS users;
-- +goose StatementEnd