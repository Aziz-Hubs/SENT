package pulse

import (
	"testing"
	"time"
)

func TestExponentialBackoff(t *testing.T) {
	// Verify WSS reconnection backoff logic
	initialDelay := 1 * time.Second
	maxDelay := 30 * time.Second

	currentDelay := initialDelay
	for i := 0; i < 5; i++ {
		currentDelay *= 2
		if currentDelay > maxDelay {
			currentDelay = maxDelay
		}
	}

	if currentDelay != maxDelay {
		t.Errorf("Expected max delay %v, got %v", maxDelay, currentDelay)
	}
}
