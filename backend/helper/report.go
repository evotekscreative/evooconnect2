package helper

import (
	"errors"
	"strings"
	"net/http"
	"encoding/json"
)

var allowedReasons = []string{
	"Harassment", "Fraud", "Spam", "Missinformation", "Hate Speech",
	"Threats or violence", "self-harm", "Graphic or violent content",
	"Dangerous or extremist organizations", "Sexual Content", "Fake Account",
	"Child Exploitation", "Illegal products and services", "Infringement","Other",
}

func ValidateReport(reason, other string) error {
	for _, allowed := range allowedReasons {
		if reason == allowed {
			if reason == "Other" && strings.TrimSpace(other) == "" {
				return errors.New("the 'Other' reason must be specified")
			}
			return nil
		}
	}
	return errors.New("invalid report reason")
}

func WriteJSON(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(payload)
}