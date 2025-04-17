package db

import (
	"be-evoconnect/model"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	// Memuat file .env
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file")
	}

	// Mendapatkan konfigurasi database dari environment variables
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	// Membuat string DSN untuk koneksi ke PostgreSQL
	dsn := "host=" + host + " user=" + user + " password=" + password + " dbname=" + dbname + " port=" + port + " sslmode=disable"

	var err error

	// Membuka koneksi ke database menggunakan GORM
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{SkipDefaultTransaction: true})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Connected to database")

	// Auto-migrate untuk model
	models := []interface{}{
		&model.User{},
	}

	if err := DB.AutoMigrate(models...); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migrated")
}
