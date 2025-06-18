package controller

import (
    "net/http"
    "github.com/julienschmidt/httprouter"
    
)

type GroupPinnedPostController interface {
    PinPost(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    UnpinPost(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
    GetPinnedPosts(writer http.ResponseWriter, request *http.Request, params httprouter.Params)
}