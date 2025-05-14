package helper

import (
	"context"
	"net"
	"net/http"
	"strings"
)

// GetClientIP extracts client IP from context or request headers
// It handles proxy and load balancer scenarios by checking various headers
func GetClientIP(ctx context.Context) string {
	// Get IP from context
	if ip, ok := ctx.Value("client_ip").(string); ok && isValidIP(ip) {
		return ip
	}

	// If we can't get from context, try to get from request
	if r, ok := ctx.Value("http_request").(*http.Request); ok {
		// Try to get IP from various headers first
		ip := getIPFromHeaders(r)
		if ip != "" {
			return ip
		}

		// Fall back to RemoteAddr if no valid header IP
		if r.RemoteAddr != "" {
			ip = r.RemoteAddr
			// Strip port if present (common format is IP:port)
			if host, _, err := net.SplitHostPort(ip); err == nil {
				ip = host
			}

			if isValidIP(ip) {
				return ip
			}
		}
	}

	return "localhost" // Return localhost as default
}

// getIPFromHeaders extracts client IP from common proxy/load balancer headers
func getIPFromHeaders(r *http.Request) string {
	// Check headers in order of reliability
	headerNames := []string{
		"X-Forwarded-For",
		"X-Real-IP",
		"CF-Connecting-IP", // Cloudflare
		"True-Client-IP",
		"X-Client-IP",
	}

	for _, headerName := range headerNames {
		headerValue := r.Header.Get(headerName)
		if headerValue != "" {
			// X-Forwarded-For may contain multiple IPs, use the first one
			if headerName == "X-Forwarded-For" {
				ips := strings.Split(headerValue, ",")
				if len(ips) > 0 {
					ip := strings.TrimSpace(ips[0])
					if isValidIP(ip) {
						return ip
					}
				}
			} else {
				// For other headers, use the value directly if valid
				if isValidIP(headerValue) {
					return headerValue
				}
			}
		}
	}
	return ""
}

// isValidIP checks if the provided string is a valid IP address
func isValidIP(ip string) bool {
	// Handle empty strings
	if ip == "" {
		return false
	}

	// Parse as IP to validate
	parsedIP := net.ParseIP(ip)
	return parsedIP != nil
}
