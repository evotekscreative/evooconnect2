package helper

import (
	"log"
)

func PanicIfError(err error) {
	if err != nil {
		log.Println("Error:", err)
		panic(err)
	}
}


