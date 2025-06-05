package helper

import (
	"log"

	"time"
)

// InitTimezone initializes the application timezone to Asia/Jakarta

func InitTimezone(locale string) {

	location, err := time.LoadLocation(locale)
	if err != nil {
		log.Printf("Failed to load timezone location: %v", err)
		return
	}

	time.Local = location
}
