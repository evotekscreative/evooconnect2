package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
	// "fmt"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type AuthControllerImpl struct {
	AuthService service.AuthService
}

func NewAuthController(authService service.AuthService) AuthController {
	return &AuthControllerImpl{
		AuthService: authService,
	}
}

// Add this new method to your AuthControllerImpl
func (controller *AuthControllerImpl) GoogleAuth(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Parse request body to get Google token
	googleAuthRequest := web.GoogleAuthRequest{}
	helper.ReadFromRequestBody(request, &googleAuthRequest)

	// Call service to authenticate with Google
	authResponse, err := controller.AuthService.GoogleAuth(request.Context(), googleAuthRequest)
	if err != nil {
		webResponse := web.WebResponse{
			Code:   http.StatusBadRequest,
			Status: "BAD REQUEST",
			Data:   err.Error(),
		}
		helper.WriteToResponseBody(writer, webResponse)
		return
	}

	// Create success response
	webResponse := web.WebResponse{
		Code:   http.StatusOK,
		Status: "OK",
		Data:   authResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *AuthControllerImpl) Login(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	loginRequest := web.LoginRequest{}
	helper.ReadFromRequestBody(request, &loginRequest)

	loginResponse := controller.AuthService.Login(request.Context(), loginRequest)
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   loginResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *AuthControllerImpl) Register(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	registerRequest := web.RegisterRequest{}
	helper.ReadFromRequestBody(request, &registerRequest)

	registerResponse := controller.AuthService.Register(request.Context(), registerRequest)

	// Pastikan status code adalah 201 untuk menandakan resource baru dibuat
	webResponse := web.WebResponse{
		Code:   201,
		Status: "CREATED",
		Data:   registerResponse,
	}

	// Set status code pada response writer juga
	// writer.WriteHeader(http.StatusCreated)
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *AuthControllerImpl) SendVerificationEmail(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	emailRequest := web.EmailRequest{}
	helper.ReadFromRequestBody(request, &emailRequest)

	messageResponse := controller.AuthService.SendVerificationEmail(request.Context(), emailRequest)
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   messageResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

// controller/auth_controller.go

func (controller *AuthControllerImpl) VerifyEmail(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	// Baca body request yang hanya berisi token verifikasi
	verifyRequest := web.VerificationRequest{}
	helper.ReadFromRequestBody(request, &verifyRequest)

	// Debug untuk melihat context yang diterima
	// userID := request.Context().Value("user_id")
	// email := request.Context().Value("email")
	// fmt.Printf("VerifyEmail controller - Context values: user_id=%v, email=%v\n", userID, email)

	// Panggil service
	response := controller.AuthService.VerifyEmail(request.Context(), verifyRequest)

	// Buat response
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   response,
	}

	// Kirim response
	writer.Header().Add("Content-Type", "application/json")
	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *AuthControllerImpl) ForgotPassword(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	emailRequest := web.EmailRequest{}
	helper.ReadFromRequestBody(request, &emailRequest)

	messageResponse := controller.AuthService.ForgotPassword(request.Context(), emailRequest)
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   messageResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}

func (controller *AuthControllerImpl) ResetPassword(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	resetRequest := web.ResetPasswordRequest{}
	helper.ReadFromRequestBody(request, &resetRequest)

	messageResponse := controller.AuthService.ResetPassword(request.Context(), resetRequest)
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   messageResponse,
	}

	helper.WriteToResponseBody(writer, webResponse)
}
