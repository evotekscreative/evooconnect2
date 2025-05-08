package helper

import (
	"errors"
	"strings"
	"net/http"
	"encoding/json"
)

var allowedReasons = []string{
	"Pelecehan", "Penipuan", "Spam", "Misinformasi", "Ujaran kebencian",
	"Ancaman atau kekerasan", "Menyakiti diri sendiri", "Konten sadis",
	"Organisasi berbahaya atau ekstremis", "Konten seksual", "Akun palsu",
	"Eksploitasi anak", "Produk dan layanan ilegal", "Pelanggaran", "lainnya",
}

func ValidateReport(reason, other string) error {
	for _, allowed := range allowedReasons {
		if reason == allowed {
			if reason == "lainnya" && strings.TrimSpace(other) == "" {
				return errors.New("alasan lainnya harus diisi")
			}
			return nil
		}
	}
	return errors.New("alasan report tidak valid")
}

func WriteJSON(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(payload)
}