package helper

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"
)

// SaveBlogImageWithUniqueName menyimpan gambar blog dengan nama unik
func SaveBlogImageWithUniqueName(file multipart.File, header *multipart.FileHeader) (string, error) {
	// Generate unique filename to avoid overwriting
	timestamp := fmt.Sprintf("%d", time.Now().UnixNano())
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("uploads/blog-%s%s", timestamp, ext)

	// Buat folder kalau belum ada
	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
			return "", err
		}
	}

	out, err := os.Create(filename)
	if err != nil {
		return "", err
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		return "", err
	}

	return filename, nil
}

// DeleteFileIfExists menghapus file jika ada
func DeleteFileIfExists(filePath string) error {
	if filePath == "" {
		return nil // Tidak ada file untuk dihapus
	}

	// Periksa apakah file ada
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil // File sudah tidak ada, tidak perlu error
	}

	// Hapus file
	return os.Remove(filePath)
}