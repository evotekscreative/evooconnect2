package helper

import (
	"github.com/joho/godotenv"
	"log"
	"os"
	"strconv"
)

// LoadEnv loads environment variables from .env file
func LoadEnv() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found or couldn't be loaded. Using default environment variables.")
	} else {
		log.Println("Environment variables loaded from .env file")
	}
}

// GetEnv returns environment variable or default value
func GetEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	return fallback
}

// GetEnvInt returns environment variable as integer or default value
func GetEnvInt(key string, fallback int) int {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return fallback
}
