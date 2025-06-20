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

	db.SetMaxOpenConns(25)                 // Batasi jumlah koneksi total
	db.SetMaxIdleConns(10)                 // Jumlah koneksi idle yang dipertahankan
	db.SetConnMaxLifetime(5 * time.Minute) // Waktu maksimum penggunaan koneksi
	db.SetConnMaxIdleTime(3 * time.Minute)

	err = db.Ping()
	if err != nil {
		log.Println("Error connecting to database:", err)
		return nil
	}
	log.Println("Connected to database successfully")
	helper.PanicIfError(err)

	return db
}

// func NewAdminDB() *sql.DB {
// 	// Gunakan environment variable terpisah untuk admin DB
// 	dbHost := os.Getenv("ADMIN_DB_HOST")
// 	dbUser := os.Getenv("ADMIN_DB_USER")
// 	dbPassword := os.Getenv("ADMIN_DB_PASSWORD")
// 	dbName := os.Getenv("ADMIN_DB_NAME")

// 	// Default values if not set
// 	if dbHost == "" {
// 		dbHost = os.Getenv("DB_HOST")
// 	}
// 	if dbUser == "" {
// 		dbUser = os.Getenv("DB_USER")
// 	}
// 	if dbPassword == "" {
// 		dbPassword = os.Getenv("DB_PASSWORD")
// 	}
// 	if dbName == "" {
// 		dbName = "admin_evoconnect"
// 	}

// 	dsn := dbUser + ":" + dbPassword + "@tcp(" + dbHost + ")/" + dbName + "?parseTime=true"

// 	db, err := sql.Open("mysql", dsn)
// 	helper.PanicIfError(err)

// 	db.SetMaxIdleConns(5)
// 	db.SetMaxOpenConns(20)
// 	db.SetConnMaxLifetime(60 * time.Minute)
// 	db.SetConnMaxIdleTime(10 * time.Minute)

// 	return db
// }
