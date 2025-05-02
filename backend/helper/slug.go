package helper

import (
	"strings"
	"unicode"
)

func GenerateSlug(title string, suffix string) string {
	slug := strings.ToLower(title + "-" + suffix)

	slug = strings.Map(func(r rune) rune {
		if unicode.IsSpace(r) {
			return '-'
		}
		if unicode.IsLetter(r) || unicode.IsNumber(r) || r == '-' {
			return r
		}
		return -1
	}, slug)

	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}

	return strings.Trim(slug, "-")
}
