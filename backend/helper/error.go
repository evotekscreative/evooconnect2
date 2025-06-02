package helper

import (
	"log"
)

func PanicIfError(err error) {
	if err != nil {
		log.Printf("ERROR DETAILS: %v", err)
		log.Printf("ERROR TYPE: %T", err)
		panic(err)
	}
}
