package agent

import (
	"fmt"
	"time"

	"github.com/gosnmp/gosnmp"
)

type SnmpDevice struct {
	IP        string
	Community string // default public
	Port      uint16
}

type SnmpInfo struct {
	SysName    string   `json:"sys_name"`
	SysDescr   string   `json:"sys_descr"`
	Uptime     string   `json:"uptime"`
	Interfaces int      `json:"interfaces"`
	Error      string   `json:"error,omitempty"`
}

func NewSnmpDevice(ip string, community string) *SnmpDevice {
    if community == "" { community = "public" }
    return &SnmpDevice{
        IP:        ip,
        Community: community,
        Port:      161,
    }
}

func (d *SnmpDevice) Poll() *SnmpInfo {
	params := &gosnmp.GoSNMP{
		Target:    d.IP,
		Port:      d.Port,
		Community: d.Community,
		Version:   gosnmp.Version2c,
		Timeout:   time.Duration(2) * time.Second,
		Retries:   1,
	}

    info := &SnmpInfo{}

	if err := params.Connect(); err != nil {
        info.Error = fmt.Sprintf("Connection failed: %v", err)
		return info
	}
	defer params.Conn.Close()

	oids := []string{
		"1.3.6.1.2.1.1.5.0", // sysName
		"1.3.6.1.2.1.1.1.0", // sysDescr
		"1.3.6.1.2.1.1.3.0", // sysUpTime
        "1.3.6.1.2.1.2.1.0", // ifNumber
	}

	result, err := params.Get(oids)
	if err != nil {
        info.Error = fmt.Sprintf("Get failed: %v", err)
		return info
	}

	for _, variable := range result.Variables {
		switch variable.Name {
		case ".1.3.6.1.2.1.1.5.0":
            if val, ok := variable.Value.([]byte); ok {
			    info.SysName = string(val)
            }
		case ".1.3.6.1.2.1.1.1.0":
            if val, ok := variable.Value.([]byte); ok {
			    info.SysDescr = string(val)
            }
		case ".1.3.6.1.2.1.1.3.0":
            // TimeTicks
            ticks := gosnmp.ToBigInt(variable.Value)
            if ticks != nil {
                info.Uptime = (time.Duration(ticks.Int64()) * 10 * time.Millisecond).String()
            }
        case ".1.3.6.1.2.1.2.1.0":
             val := gosnmp.ToBigInt(variable.Value)
             if val != nil {
                info.Interfaces = int(val.Int64())
             }
		}
	}

	return info
}
