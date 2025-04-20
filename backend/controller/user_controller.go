package controller

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

type UserController interface {
	GetProfile(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
