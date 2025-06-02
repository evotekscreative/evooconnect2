package controller

import (
    "github.com/julienschmidt/httprouter"
    "net/http"
)

type AdminAuthController interface {
    Login(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    Register(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}