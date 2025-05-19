package controller

import (
	"github.com/julienschmidt/httprouter"
	"net/http"
)

type ProfileViewController interface {
	GetViewsThisWeek(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
	GetViewsLastWeek(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
