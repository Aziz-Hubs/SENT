package agent

type InputController interface {
	Move(x, y int)
	MouseToggle(button, direction string)
	KeyToggle(key, direction string)
}

var currentInputController InputController
