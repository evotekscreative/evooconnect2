package helper

import (
	"encoding/json"
	"evoconnect/backend/model/web"
	"net/http"
)

func ReadFromRequestBody(request *http.Request, result interface{}) {
	decoder := json.NewDecoder(request.Body)
	err := decoder.Decode(result)
	PanicIfError(err)
}

func WriteToResponseBody(writer http.ResponseWriter, response web.WebResponse) {
	writer.Header().Add("Content-Type", "application/json")
	writer.WriteHeader(response.Code) // Set status code berdasarkan response.Code

	encoder := json.NewEncoder(writer)
	err := encoder.Encode(response)
	if err != nil {
		panic(err)
	}
}
