package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type AuthController interface {
	Login(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	Register(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	SendVerificationEmail(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	VerifyEmail(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	ForgotPassword(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	ResetPassword(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GoogleAuth(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
