//go:build windows

package agent

import "log"

type WindowsInputController struct{}

func (w *WindowsInputController) Move(x, y int) {
	// TODO: Implement using User32.dll SendInput for pure Go Windows support
	log.Printf("[INPUT] Windows Move to %d, %d (Stub)", x, y)
}

func (w *WindowsInputController) MouseToggle(button, direction string) {
	log.Printf("[INPUT] Windows Mouse %s %s (Stub)", button, direction)
}

func (w *WindowsInputController) KeyToggle(key, direction string) {
	log.Printf("[INPUT] Windows Key %s %s (Stub)", key, direction)
}

func init() {
	currentInputController = &WindowsInputController{}
}
