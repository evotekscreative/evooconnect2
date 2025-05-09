package helper

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"strconv"
	"strings"
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

func ReadFromRequestForm(request *http.Request, result interface{}) {
	if err := request.ParseMultipartForm(0); err != nil {
		PanicIfError(err)
	}

	body, err := json.Marshal(request.MultipartForm.Value)
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

func ReadFromMultipartForm(request *http.Request, result interface{}) {
	val := reflect.ValueOf(result).Elem()
	typ := val.Type()

	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		if !field.CanSet() {
			continue
		}

		// Get form field name from json tag or use struct field name
		fieldType := typ.Field(i)
		var formKey string

		jsonTag := fieldType.Tag.Get("json")
		if jsonTag != "" && jsonTag != "-" {
			// Extract the field name from the json tag
			formKey = strings.Split(jsonTag, ",")[0]
		} else {
			formKey = strings.ToLower(fieldType.Name)
		}

		// Get form value
		formValue := request.FormValue(formKey)
		if formValue == "" {
			continue
		}

		// Set the value based on field type
		switch field.Kind() {
		case reflect.String:
			field.SetString(formValue)
		case reflect.Int, reflect.Int64:
			if intVal, err := strconv.ParseInt(formValue, 10, 64); err == nil {
				field.SetInt(intVal)
			}
		case reflect.Bool:
			if boolVal, err := strconv.ParseBool(formValue); err == nil {
				field.SetBool(boolVal)
			}
		case reflect.Ptr:
			// Handle pointer fields
			if field.IsNil() {
				// Create a new instance of the pointed type
				field.Set(reflect.New(field.Type().Elem()))
			}

			// Set the value based on the pointer's underlying type
			ptrElem := field.Elem()
			switch ptrElem.Kind() {
			case reflect.String:
				ptrElem.SetString(formValue)
			case reflect.Int, reflect.Int64:
				if intVal, err := strconv.ParseInt(formValue, 10, 64); err == nil {
					ptrElem.SetInt(intVal)
				}
			case reflect.Bool:
				if boolVal, err := strconv.ParseBool(formValue); err == nil {
					ptrElem.SetBool(boolVal)
				}
			}
			// Add more pointer types as needed
		}
	}
}
