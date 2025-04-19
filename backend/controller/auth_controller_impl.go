package controller

import (
	"evoconnect/backend/helper"
	"evoconnect/backend/model/web"
	"evoconnect/backend/service"
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

func (controller *AuthControllerImpl) VerifyEmail(writer http.ResponseWriter, request *http.Request, params httprouter.Params) {
	verificationRequest := web.VerificationRequest{}
	helper.ReadFromRequestBody(request, &verificationRequest)

	messageResponse := controller.AuthService.VerifyEmail(request.Context(), verificationRequest)
	webResponse := web.WebResponse{
		Code:   200,
		Status: "OK",
		Data:   messageResponse,
	}

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
