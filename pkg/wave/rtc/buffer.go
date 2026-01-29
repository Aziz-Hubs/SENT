package rtc

import (
	"sync"
	"time"

	"github.com/pion/rtp"
)

// JitterBuffer manages incoming RTP packets to mitigate network jitter.
type JitterBuffer struct {
	mu          sync.Mutex
	packets     map[uint16]*rtp.Packet
	lastSeq     uint16
	bufferSize  time.Duration
	adaptive    bool
}

// NewJitterBuffer initializes a new JitterBuffer.
func NewJitterBuffer(size time.Duration, adaptive bool) *JitterBuffer {
	return &JitterBuffer{
		packets:    make(map[uint16]*rtp.Packet),
		bufferSize: size,
		adaptive:   adaptive,
	}
}

// Push adds a packet to the buffer.
func (b *JitterBuffer) Push(p *rtp.Packet) {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.packets[p.SequenceNumber] = p
	
	// Adaptive logic could go here to adjust bufferSize based on arrival timestamps
}

// Pop retrieves the next expected packet from the buffer.
func (b *JitterBuffer) Pop() *rtp.Packet {
	b.mu.Lock()
	defer b.mu.Unlock()

	nextSeq := b.lastSeq + 1
	if p, ok := b.packets[nextSeq]; ok {
		delete(b.packets, nextSeq)
		b.lastSeq = nextSeq
		return p
	}

	return nil
}
