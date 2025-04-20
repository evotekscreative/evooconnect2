package helper

import (
	"crypto/rand"
	"encoding/binary"
)

// GenerateRandomInt generates a random integer between min and max (inclusive).
func RandomInt(min, max int) int {
	b := make([]byte, 4)
	_, err := rand.Read(b)
	if err != nil {
		// If crypto/rand fails, panic as this is a serious security issue
		panic(err)
	}

	n := int(binary.BigEndian.Uint32(b))
	return n%(max-min+1) + min
}
