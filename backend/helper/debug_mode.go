package helper

func DebugMode() bool {
	debug := GetEnvBool("DEBUG_MODE", false)
	return debug
}
