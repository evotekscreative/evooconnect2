package helper

import (
	"fmt"
	"net/smtp"
)

var (
	// EmailSender can be mocked in tests
	EmailSender = sendEmail
)

// EmailConfig holds email server configuration
type EmailConfig struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
}

// GetEmailConfig reads email configuration from environment or uses defaults
func GetEmailConfig() EmailConfig {
	return EmailConfig{
		Host:     GetEnv("EMAIL_HOST", "smtp.gmail.com"),
		Port:     GetEnvInt("EMAIL_PORT", 587),
		Username: GetEnv("EMAIL_USERNAME", "your-email@gmail.com"),
		Password: GetEnv("EMAIL_PASSWORD", "your-password"),
		From:     GetEnv("EMAIL_FROM", "EvoConnect <noreply@evoconnect.com>"),
	}
}

// sendEmail sends an email using SMTP
func sendEmail(to, subject, body string) error {
	config := GetEmailConfig()

	// More detailed logging
	// fmt.Printf("Email configuration: Host=%s, Port=%d, Username=%s, From=%s\n",
	// 	config.Host, config.Port, config.Username, config.From)

	auth := smtp.PlainAuth("", config.Username, config.Password, config.Host)

	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	msg := []byte("Subject: " + subject + "\n" +
		"From: " + config.From + "\n" +
		"To: " + to + "\n" +
		mime + "\n" +
		body)

	addr := fmt.Sprintf("%s:%d", config.Host, config.Port)
	return smtp.SendMail(addr, auth, config.Username, []string{to}, msg)
}
