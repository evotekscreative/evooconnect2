package helper

import "golang.org/x/crypto/bcrypt"

// Declare HashPassword as a variable so it can be overridden in tests
var HashPassword = hashPassword

// The actual implementation
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// ComparePasswords compares a hashed password with a plaintext password
func ComparePasswords(hashedPassword, plainPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
}
