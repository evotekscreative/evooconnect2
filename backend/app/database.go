package app

import (
	"database/sql"
	"evoconnect/backend/helper"
	"fmt"
	"log"
	"time"
)

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DbName   string
	SSLMode  string
}

func GetDatabaseConfig() DatabaseConfig {
	return DatabaseConfig{
		Host:     helper.GetEnv("DB_HOST", "localhost"),
		Port:     helper.GetEnvInt("DB_PORT", 5432),
		User:     helper.GetEnv("DB_USERNAME", "postgres"),
		Password: helper.GetEnv("DB_PASSWORD", "root"),
		DbName:   helper.GetEnv("DB_NAME", "go_database"),
		SSLMode:  helper.GetEnv("DB_SSLMODE", "disable"),
	}
}

func NewDB() *sql.DB {
	config := GetDatabaseConfig()
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.DbName, config.SSLMode)
	log.Println("Connecting to database...")
	db, err := sql.Open("postgres", dsn)
	helper.PanicIfError(err)

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)

	err = db.Ping()
	if err != nil {
		log.Println("Error connecting to database:", err)
		return nil
	}
	log.Println("Connected to database successfully")
	helper.PanicIfError(err)

	return db
}
