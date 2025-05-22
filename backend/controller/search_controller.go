package controller


import (
    "github.com/julienschmidt/httprouter"
    "net/http"
)


type SearchController interface {
    Search(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}
