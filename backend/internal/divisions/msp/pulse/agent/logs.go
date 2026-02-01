package agent

import (
	"bufio"
	"bytes"
	"encoding/json"
	"os/exec"
	"runtime"
)

type LogEntry struct {
	Time    string `json:"time"`
	Level   string `json:"level"` // "Error", "Warning", "Info"
	Source  string `json:"source"`
	Message string `json:"message"`
	EventID int    `json:"event_id,omitempty"`
}

// GetSystemLogs returns the last 50 error/warning logs
func GetSystemLogs() ([]LogEntry, error) {
	if runtime.GOOS == "windows" {
		return getWindowsLogs()
	}
	return getLinuxLogs()
}

func getWindowsLogs() ([]LogEntry, error) {
	// Get-EventLog -LogName System -Newest 50 -EntryType Error,Warning | Select-Object TimeGenerated,EntryType,Source,Message,EventID | ConvertTo-Json
	script := `Get-EventLog -LogName System -Newest 50 -EntryType Error,Warning | Select-Object @{Name='Time';Expression={$_.TimeGenerated.ToString('yyyy-MM-dd HH:mm:ss')}},@{Name='Level';Expression={$_.EntryType}},Source,Message,EventID | ConvertTo-Json -Compress`

	cmd := exec.Command("powershell", "-NoProfile", "-Command", script)
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	var rawLogs []map[string]interface{}
	if err := json.Unmarshal(output, &rawLogs); err != nil {
		// Single object case
		var single map[string]interface{}
		if err2 := json.Unmarshal(output, &single); err2 == nil {
			rawLogs = append(rawLogs, single)
		}
	}

	var logs []LogEntry
	for _, l := range rawLogs {
		level, _ := l["Level"].(float64) // PS enum often int
		levelStr := "Info"
		if level == 1 {
			levelStr = "Error"
		}
		if level == 2 {
			levelStr = "Warning"
		}
		// Attempt string check too
		if lvlStr, ok := l["Level"].(string); ok {
			levelStr = lvlStr
		}

		eid, _ := l["EventID"].(float64)

		logs = append(logs, LogEntry{
			Time:    getString(l, "Time"),
			Level:   levelStr,
			Source:  getString(l, "Source"),
			Message: getString(l, "Message"),
			EventID: int(eid),
		})
	}
	return logs, nil
}

func getLinuxLogs() ([]LogEntry, error) {
	// journalctl -p 3..4 -n 50 --output=json
	cmd := exec.Command("journalctl", "-p", "3..4", "-n", "50", "--output=json")
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	var logs []LogEntry
	scanner := bufio.NewScanner(bytes.NewReader(output))
	for scanner.Scan() {
		line := scanner.Bytes()
		var entry map[string]interface{}
		if err := json.Unmarshal(line, &entry); err == nil {
			// Journald JSON fields: MESSAGE, PRIORITY, SYSLOG_IDENTIFIER, __REALTIME_TIMESTAMP
			msg := getString(entry, "MESSAGE")
			source := getString(entry, "SYSLOG_IDENTIFIER")
			prioStr := getString(entry, "PRIORITY")

			level := "Info"
			if prioStr == "3" {
				level = "Error"
			}
			if prioStr == "4" {
				level = "Warning"
			}

			logs = append(logs, LogEntry{
				Time:    getString(entry, "__REALTIME_TIMESTAMP"), // Needs fetch conversion usually, simplified here
				Level:   level,
				Source:  source,
				Message: msg,
			})
		}
	}
	return logs, nil
}
