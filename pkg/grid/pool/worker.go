package pool

import (
	"context"
	"fmt"
	"sync"
	"time"

	"golang.org/x/crypto/ssh"
)

// Task represents a network automation job.
type Task struct {
	DeviceIP string
	Command  string
	Vendor   string
	Result   chan Result
}

// Result captures the outcome of a Task.
type Result struct {
	DeviceIP string
	Output   string
	Error    error
	Duration time.Duration
}

// WorkerPool manages concurrent SSH sessions to network devices.
type WorkerPool struct {
	workers    int
	taskQueue  chan Task
	sshConfigs map[string]*ssh.ClientConfig
	mu         sync.RWMutex
}

// NewWorkerPool initializes a pool with a set number of workers.
func NewWorkerPool(workers int) *WorkerPool {
	return &WorkerPool{
		workers:   workers,
		taskQueue: make(chan Task, workers*10),
		sshConfigs: make(map[string]*ssh.ClientConfig),
	}
}

// Start launches the worker routines.
func (p *WorkerPool) Start(ctx context.Context) {
	for i := 0; i < p.workers; i++ {
		go p.worker(ctx)
	}
}

// Submit adds a task to the queue.
func (p *WorkerPool) Submit(task Task) {
	p.taskQueue <- task
}

func (p *WorkerPool) worker(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case task := <-p.taskQueue:
			start := time.Now()
			output, err := p.executeSSH(ctx, task)
			task.Result <- Result{
				DeviceIP: task.DeviceIP,
				Output:   output,
				Error:    err,
				Duration: time.Since(start),
			}
		}
	}
}

func (p *WorkerPool) executeSSH(ctx context.Context, task Task) (string, error) {
	p.mu.RLock()
	config, ok := p.sshConfigs[task.DeviceIP]
	p.mu.RUnlock()

	if !ok {
		// Fallback to default or JIT fetch from SENTnexus vault
		return "", fmt.Errorf("no SSH configuration found for device %s", task.DeviceIP)
	}

	// Dial with timeout from context if possible
	client, err := ssh.Dial("tcp", fmt.Sprintf("%s:22", task.DeviceIP), config)
	if err != nil {
		return "", fmt.Errorf("dial failed: %w", err)
	}
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		return "", fmt.Errorf("session failed: %w", err)
	}
	defer session.Close()

	// Handle per-command timeouts
	outputChan := make(chan []byte)
	errChan := make(chan error)

	go func() {
		out, err := session.CombinedOutput(task.Command)
		if err != nil {
			errChan <- err
			return
		}
		outputChan <- out
	}()

	select {
	case <-ctx.Done():
		return "", ctx.Err()
	case err := <-errChan:
		return "", err
	case output := <-outputChan:
		return string(output), nil
	case <-time.After(30 * time.Second): // Hard timeout per command
		return "", fmt.Errorf("command timed out")
	}
}

// SetDeviceConfig updates the SSH configuration for a device.
func (p *WorkerPool) SetDeviceConfig(ip string, user, password string) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.sshConfigs[ip] = &ssh.ClientConfig{
		User: user,
		Auth: []ssh.AuthMethod{
			ssh.Password(password),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(), // TODO: Use proper host key verification
		Timeout:         10 * time.Second,
	}
}
