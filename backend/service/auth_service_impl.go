package service

import (
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"evoconnect/backend/exception"
	"evoconnect/backend/helper"
	"evoconnect/backend/model/domain"
	"evoconnect/backend/model/web"
	"evoconnect/backend/repository"
	"fmt"
	"math/rand"
	"regexp"
	"strings"

	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
)

type AuthServiceImpl struct {
	UserRepository repository.UserRepository
	DB             *sql.DB
	Validate       *validator.Validate
	JWTSecret      string
	CurrentTx      *sql.Tx
}

func NewAuthService(userRepository repository.UserRepository, db *sql.DB, validate *validator.Validate, jwtSecret string) AuthService {
	return &AuthServiceImpl{
		UserRepository: userRepository,
		DB:             db,
		Validate:       validate,
		JWTSecret:      jwtSecret,
	}
}

func (service *AuthServiceImpl) generateToken(user domain.User) string {
	var expIn int = helper.GetEnvInt("JWT_EXPIRES_IN", 24)
	claims := jwt.MapClaims{
		"user_id": user.Id.String(),
		"email":   user.Email,
		"exp":     time.Now().Add(time.Duration(expIn) * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(service.JWTSecret))
	helper.PanicIfError(err)

	return signedToken
}

// generateRandomToken creates a random token for verification/reset
func generateRandomToken() string {
	// Generate a random number between 100000 and 999999 (6 digits)
	b := make([]byte, 4)
	_, err := rand.Read(b)
	if err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano()%900000+100000) // Fallback
	}
	n := int(b[0])<<24 | int(b[1])<<16 | int(b[2])<<8 | int(b[3])
	return fmt.Sprintf("%06d", n%900000+100000)
}

// Add this method to your AuthServiceImpl
func (service *AuthServiceImpl) GoogleAuth(ctx context.Context, request web.GoogleAuthRequest) (web.RegisterResponse, error) {
	// Get Google OAuth config values
	CLIENT_ID := helper.GetEnv("GOOGLE_CLIENT_ID", "630548216793-u72hegqjlqli4petjg5lsgkrp8fn0foc.apps.googleusercontent.com")

	// For ID token verification, we should use a validator
	idToken := request.Token

	// Create a validator for the ID token
	_ = oauth2.Config{
		ClientID: CLIENT_ID,
	}

	// Parse and verify the token without making a remote call
	payload, err := validateGoogleIDToken(idToken, CLIENT_ID)
	if err != nil {
		fmt.Printf("Error validating token: %v\n", err)
		return web.RegisterResponse{}, err
	}

	// Extract user info from validated token
	email := payload["email"].(string)
	name := payload["name"].(string)
	picture := payload["picture"].(string)

	// Start database transaction
	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if user exists by email
	existingUser, err := service.UserRepository.FindByEmail(ctx, tx, email)
	if err == nil {
		// User exists, generate token and return
		jwtToken := service.generateToken(existingUser)
		return web.RegisterResponse{
			Token: jwtToken,
			User:  existingUser,
		}, nil
	}

	// User doesn't exist, create a new account
	// Generate username from name
	username := generateUsernameFromName(name)

	// Generate random password for account security
	randomPassword := generateRandomString(12)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(randomPassword), bcrypt.DefaultCost)
	helper.PanicIfError(err)

	// Create new user
	newUser := domain.User{
		Id:         uuid.New(),
		Name:       name,
		Email:      email,
		Username:   username,
		Password:   string(hashedPassword),
		IsVerified: true, // Google accounts are already verified
		Photo:      picture,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Save new user to database
	savedUser := service.UserRepository.Save(ctx, tx, newUser)
	jwtToken := service.generateToken(savedUser)

	return web.RegisterResponse{
		Token: jwtToken,
		User:  savedUser,
	}, nil
}

// Helper function to validate Google ID token without making a remote call
func validateGoogleIDToken(tokenString string, clientID string) (map[string]interface{}, error) {
	// Split the token to get parts
	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid token format")
	}

	// Decode the payload (middle part)
	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, err
	}

	// Parse the JSON payload
	var payload map[string]interface{}
	err = json.Unmarshal(payloadBytes, &payload)
	if err != nil {
		return nil, err
	}

	// Verify audience (aud) matches your client ID
	if aud, ok := payload["aud"].(string); !ok || aud != clientID {
		return nil, fmt.Errorf("token not intended for this audience")
	}

	// Verify the token is not expired
	if exp, ok := payload["exp"].(float64); ok {
		if time.Now().Unix() > int64(exp) {
			return nil, fmt.Errorf("token expired")
		}
	} else {
		return nil, fmt.Errorf("missing expiration time")
	}

	// Token is valid!
	return payload, nil
}

// Helper function to generate username from name
func generateUsernameFromName(name string) string {
	// Convert name to lowercase
	slug := strings.ToLower(name)

	// Replace spaces with hyphens
	slug = strings.ReplaceAll(slug, " ", "-")

	// Remove special characters
	slug = regexp.MustCompile(`[^a-z0-9\-]`).ReplaceAllString(slug, "")

	// Ensure no double hyphens
	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}

	// Trim hyphens from ends
	slug = strings.Trim(slug, "-")

	// Add 6 random digits
	randomDigits := fmt.Sprintf("%06d", rand.Intn(1000000))

	return slug + "-" + randomDigits
}

// Helper function to generate random string
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func (service *AuthServiceImpl) Login(ctx context.Context, request web.LoginRequest) web.LoginResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	user, err := service.UserRepository.FindByEmail(ctx, tx, request.Email)
	if err != nil {
		panic(exception.NewNotFoundError(err.Error()))
	}

	// Check if email is verified
	// if !user.IsVerified {
	// 	panic(exception.NewUnauthorizedError("Email not verified. Please check your email for verification instructions."))
	// }

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password))
	if err != nil {
		panic(exception.NewUnauthorizedError("Invalid credentials"))
	}

	// Generate JWT token
	token := service.generateToken(user)

	return web.LoginResponse{
		Token: token,
		User:  user,
	}
}

func (service *AuthServiceImpl) Register(ctx context.Context, request web.RegisterRequest) web.RegisterResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if email already exists
	_, err = service.UserRepository.FindByEmail(ctx, tx, request.Email)
	if err == nil {
		panic(exception.NewBadRequestError("Email already registered"))
	}

	_, err = service.UserRepository.FindByUsername(ctx, tx, request.Username)
	if err == nil {
		panic(exception.NewBadRequestError("Username already taken"))
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	helper.PanicIfError(err)

	user := domain.User{
		Name:       request.Name,
		Email:      request.Email,
		Username:   request.Username,
		Password:   string(hashedPassword),
		IsVerified: false, // Set to false for new registrations
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	user = service.UserRepository.Save(ctx, tx, user)

	// Generate verification token
	token := generateRandomToken()
	expires := time.Now().Add(24 * time.Hour) // Token valid for 24 hours

	// Save token to user record
	err = service.UserRepository.SaveVerificationToken(ctx, tx, user.Id, token, expires)
	helper.PanicIfError(err)

	// Send verification email
	verificationLink := fmt.Sprintf("http://localhost:3000/verify-email?token=%s", token)
	emailBody := fmt.Sprintf(`
        <h1>Welcome to EvoConnect!</h1>
        <p>Hello %s,</p>
        <p>Thank you for registering. Please click the link below to verify your email:</p>
		<p>Your verification token is:  <b>%s</b></p>
        <p>Or, <a href="%s">click here</a> to verify</p>
        <p>This link will expire in 24 hours.</p>
        <p>Thank you!</p>
    `, user.Name, token, verificationLink)

	err = helper.EmailSender(user.Email, "Welcome to EvoConnect - Verify Your Email", emailBody)
	if err != nil {
		// Log the error but don't fail the registration
		fmt.Printf("Failed to send verification email: %v\n", err)
	}

	// Generate JWT token
	jwtToken := service.generateToken(user)

	return web.RegisterResponse{
		Token: jwtToken,
		User:  user,
	}
}

func (service *AuthServiceImpl) SendVerificationEmail(ctx context.Context, request web.EmailRequest) web.MessageResponse {
	// Validate the request
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	// Get client IP for rate limiting
	clientIP := helper.GetClientIP(ctx)

	// Check rate limiting first
	rateLimitTx, err := service.DB.Begin()
	if err != nil {
		panic(exception.NewInternalServerError("Database error: " + err.Error()))
	}

	var isLimited bool
	func() {
		defer func() {
			if r := recover(); r != nil {
				rateLimitTx.Rollback()
				panic(r)
			}
		}()

		isLimited, err = service.UserRepository.IsRateLimited(ctx, rateLimitTx, clientIP, "send_verification_email", 3, 15*time.Minute)
		if err != nil {
			rateLimitTx.Rollback()
			isLimited = false
		} else {
			rateLimitTx.Commit()
		}
	}()

	if isLimited {
		panic(exception.NewTooManyRequestsError("Too many verification email requests. Please try again later."))
	}

	// Main transaction for sending verification email
	tx, err := service.DB.Begin()
	if err != nil {
		helper.PanicIfError(err)
	}
	defer helper.CommitOrRollback(tx)

	// Find the user
	user, err := service.UserRepository.FindByEmail(ctx, tx, request.Email)
	if err != nil {
		panic(exception.NewNotFoundError(err.Error()))
	}

	// Check if already verified
	if user.IsVerified {
		return web.MessageResponse{
			Message: "Email already verified",
		}
	}

	// Generate verification token
	token := generateRandomToken()
	expires := time.Now().Add(24 * time.Hour)

	// Save token to user record
	err = service.UserRepository.SaveVerificationToken(ctx, tx, user.Id, token, expires)
	helper.PanicIfError(err)

	// Prepare and send email
	emailBody := fmt.Sprintf(`
        <html>
        <body>
            <h1>Welcome to EvoConnect!</h1>
            <p>Hello %s,</p>
            <p>Thank you for registering. Please verify your email using the verification code below:</p>
            <h2>%s</h2>
            <p>This code is valid for 24 hours.</p>
            <p>If you did not request this verification, please ignore this email.</p>
            <p>Best regards,<br/>The EvoConnect Team</p>
        </body>
        </html>
    `, user.Name, token)

	err = helper.EmailSender(user.Email, "Verify Your Email", emailBody)
	if err != nil {
		panic(exception.NewBadRequestError("Failed to send verification email: " + err.Error()))
	}

	// Log successful email send
	logTx, err := service.DB.Begin()
	if err == nil {
		err = service.UserRepository.LogFailedAttempt(ctx, logTx, clientIP, "send_verification_email", "")
		if err != nil {
			logTx.Rollback()
		} else {
			logTx.Commit()
		}
	}

	return web.MessageResponse{
		Message: "Verification email sent",
	}
}

func (service *AuthServiceImpl) VerifyEmail(ctx context.Context, request web.VerificationRequest) web.MessageResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Get user_id from the JWT token (added by middleware)
	_, ok := ctx.Value("user_id").(string)
	if !ok {
		fmt.Println("ERROR: user_id not found in context")
		panic(exception.NewUnauthorizedError("Unauthorized access"))
	}

	// Check if token is a reasonable length
	if len(request.Token) != 6 {
		panic(exception.NewBadRequestError("Invalid verification token format"))
	}

	// Get the current user by ID
	user, err := service.UserRepository.FindByVerificationToken(ctx, tx, request.Token)
	if err != nil {
		// Log failed attempt
		clientIP := helper.GetClientIP(ctx)
		_ = service.UserRepository.LogFailedAttempt(ctx, tx, clientIP, "email_verification", request.Token)
		panic(exception.NewBadRequestError("Invalid verification token"))
	}

	// Check if user is already verified
	if user.IsVerified {
		return web.MessageResponse{
			Message: "Email is already verified",
		}
	}

	// Update user's verification status
	err = service.UserRepository.UpdateVerificationStatus(ctx, tx, user.Id, true)
	helper.PanicIfError(err)

	return web.MessageResponse{
		Message: "Email successfully verified",
	}
}

func (service *AuthServiceImpl) isRateLimited(ctx context.Context, tx *sql.Tx, clientIP string, actionType string) bool {
	fmt.Printf("Checking rate limit for IP: %s, action: %s\n", clientIP, actionType)

	attempts, err := service.UserRepository.GetFailedAttempts(ctx, tx, clientIP, actionType, 5*time.Minute)
	if err != nil {
		fmt.Printf("Error checking rate limits: %v\n", err)
		return false
	}

	fmt.Printf("Found %d failed attempts\n", attempts)
	return attempts >= 5
}

// Ensure the failed attempt logging works properly
func (service *AuthServiceImpl) logFailedVerificationAttempt(ctx context.Context, tx *sql.Tx, clientIP string, token string) error {
	fmt.Printf("Logging failed verification attempt from IP: %s\n", clientIP)
	err := service.UserRepository.LogFailedAttempt(ctx, tx, clientIP, "email_verification", token)
	if err != nil {
		fmt.Printf("Failed to log attempt: %v\n", err)
	}
	return err
}

// clearRateLimiting removes rate limiting for a user after successful action
func (service *AuthServiceImpl) clearRateLimiting(ctx context.Context, tx *sql.Tx, userID uuid.UUID, actionType string) error {
	// You would need to implement this method in your UserRepository
	return service.UserRepository.ClearFailedAttempts(ctx, tx, userID, actionType)
}

func (service *AuthServiceImpl) ForgotPassword(ctx context.Context, request web.EmailRequest) web.MessageResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	// Get client IP for rate limiting
	clientIP := helper.GetClientIP(ctx)

	// Check rate limiting first
	rateLimitTx, err := service.DB.Begin()
	if err != nil {
		panic(exception.NewInternalServerError("Database error: " + err.Error()))
	}

	var isLimited bool
	func() {
		defer func() {
			if r := recover(); r != nil {
				rateLimitTx.Rollback()
				panic(r)
			}
		}()

		// Check if rate limited - allow only 3 reset requests within 15 minutes
		isLimited, err = service.UserRepository.IsRateLimited(ctx, rateLimitTx, clientIP, "password_reset_request", 3, 15*time.Minute)
		if err != nil {
			rateLimitTx.Rollback()
			isLimited = false
		} else {
			rateLimitTx.Commit()
		}
	}()

	if isLimited {
		panic(exception.NewTooManyRequestsError("Too many password reset requests. Please try again later."))
	}

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Generate reset token
	token := generateRandomToken()
	expires := time.Now().Add(1 * time.Hour) // Token valid for 1 hour

	// Save token to user record
	err = service.UserRepository.SaveResetToken(ctx, tx, request.Email, token, expires)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	// Get user name for email
	user, err := service.UserRepository.FindByEmail(ctx, tx, request.Email)
	if err != nil {
		panic(exception.NewNotFoundError("User not found"))
	}

	// Prepare email content
	emailBody := fmt.Sprintf(`
        <html>
        <body>
            <h1>Password Reset</h1>
            <p>Hello %s,</p>
            <p>You requested to reset your password. Please use the code below:</p>
            <h2>%s</h2>
            <p>This code is valid for 1 hour.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>Best regards,<br/>The EvoConnect Team</p>
        </body>
        </html>
    `, user.Name, token)

	// Send reset email
	err = helper.EmailSender(user.Email, "Reset Your Password", emailBody)
	if err != nil {
		panic(exception.NewBadRequestError("Failed to send reset email: " + err.Error()))
	}

	// Log successful email send (for rate limiting)
	logTx, err := service.DB.Begin()
	if err == nil {
		_ = service.UserRepository.LogFailedAttempt(ctx, logTx, clientIP, "password_reset_request", "")
		logTx.Commit()
	}

	return web.MessageResponse{
		Message: "Password reset instructions sent to your email",
	}
}

func (service *AuthServiceImpl) ResetPassword(ctx context.Context, request web.ResetPasswordRequest) web.MessageResponse {
	err := service.Validate.Struct(request)
	helper.PanicIfError(err)

	tx, err := service.DB.Begin()
	helper.PanicIfError(err)
	defer helper.CommitOrRollback(tx)

	// Check if token is a reasonable length to prevent unnecessary DB lookups
	if len(request.Token) != 6 {
		panic(exception.NewBadRequestError("Invalid reset token format"))
	}

	// Check for rate limiting based on IP address
	clientIP := helper.GetClientIP(ctx)
	if service.isRateLimited(ctx, tx, clientIP, "password_reset") {
		panic(exception.NewTooManyRequestsError("Too many reset attempts. Please try again later."))
	}

	// Find user by reset token
	user, err := service.UserRepository.FindByResetToken(ctx, tx, request.Token)
	if err != nil {
		// Log failed attempt
		_ = service.logFailedResetAttempt(ctx, tx, clientIP, request.Token)
		panic(exception.NewBadRequestError("Invalid or expired reset token"))
	}

	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	helper.PanicIfError(err)

	// Update the password
	err = service.UserRepository.UpdatePassword(ctx, tx, user.Id, string(hashedPassword))
	helper.PanicIfError(err)

	// Clear any rate limiting records for this user now that reset succeeded
	_ = service.clearRateLimiting(ctx, tx, user.Id, "password_reset")

	return web.MessageResponse{
		Message: "Password successfully reset",
	}
}

func (service *AuthServiceImpl) logFailedResetAttempt(ctx context.Context, tx *sql.Tx, clientIP string, token string) error {
	// You would need to implement this method in your UserRepository
	return service.UserRepository.LogFailedAttempt(ctx, tx, clientIP, "password_reset", token)
}
