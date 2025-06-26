package helper

import (
	"log"
)

func PanicIfError(err error) {
	if err != nil {
		log.Printf("ERROR DETAILS: %v", err)
		log.Printf("ERROR TYPE: %T", err)
		panic(map[string]interface{}{
			"error":   err.Error(),
			"message": "Internal server error occurred",
			"status":  500,
		})
	}
}

func ValidationError(err error) error {
	if err != nil {
		log.Printf("Validation error: %v", err)
		return err
	}
	return nil
}
