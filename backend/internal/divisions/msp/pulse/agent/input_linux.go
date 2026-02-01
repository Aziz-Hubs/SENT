//go:build linux

package agent

import "github.com/go-vgo/robotgo"

type RobotInputController struct{}

func (r *RobotInputController) Move(x, y int) {
	robotgo.Move(x, y)
}

func (r *RobotInputController) MouseToggle(button, direction string) {
	robotgo.Toggle(button, direction)
}

func (r *RobotInputController) KeyToggle(key, direction string) {
	robotgo.KeyToggle(key, direction)
}

func init() {
	currentInputController = &RobotInputController{}
}
