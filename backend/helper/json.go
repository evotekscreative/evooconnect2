package helper

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

func ReadFromRequestBody(request *http.Request, result interface{}) {
    if request.Body == nil {
        PanicIfError(fmt.Errorf("request body is empty"))
    }

    body, err := io.ReadAll(request.Body)
    PanicIfError(err)

    if len(body) == 0 {
        PanicIfError(fmt.Errorf("request body is empty"))
    }

    err = json.Unmarshal(body, result)
    PanicIfError(err)
}

func WriteToResponseBody(writer http.ResponseWriter, response interface{}) {
    writer.Header().Add("Content-Type", "application/json")
    encoder := json.NewEncoder(writer)
    err := encoder.Encode(response)
    PanicIfError(err)
}