package agent

import (
	"os"
	"strings"
)

type EnvVar struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// GetEnvironmentVariables returns the system environment variables
func GetEnvironmentVariables() []EnvVar {
	raw := os.Environ()
	var envs []EnvVar
	for _, entry := range raw {
		parts := strings.SplitN(entry, "=", 2)
		if len(parts) == 2 {
			envs = append(envs, EnvVar{
				Key:   parts[0],
				Value: parts[1],
			})
		}
	}
	return envs
}
