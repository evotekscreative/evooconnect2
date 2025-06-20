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

func ParseDateString(dateString string) (time.Time, error) {
	// Parse the date string in the format "2006-01-02"
	parsedTime, err := time.Parse("2006-01-02", dateString)
	if err != nil {
		return time.Time{}, err
	}
	return parsedTime, nil
}
