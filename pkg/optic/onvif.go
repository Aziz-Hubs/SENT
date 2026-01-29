package optic

import (
	"bytes"
	"fmt"
	"net/http"
	"time"
)

// ONVIFClient provides a minimal SOAP interface for PTZ operations.
type ONVIFClient struct {
	Endpoint string
	Username string
	Password string
}

// ContinuousMove sends a continuous move command.
func (c *ONVIFClient) ContinuousMove(x, y, zoom float64) error {
	soap := fmt.Sprintf(`
		<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:tptz="http://www.onvif.org/ver20/ptz/wsdl" xmlns:tt="http://www.onvif.org/ver10/schema">
			<s:Body>
				<tptz:ContinuousMove>
					<tptz:ProfileToken>ProfileToken_1</tptz:ProfileToken>
					<tptz:Velocity>
						<tt:PanTilt x="%f" y="%f"/>
						<tt:Zoom x="%f"/>
					</tptz:Velocity>
				</tptz:ContinuousMove>
			</s:Body>
		</s:Envelope>`, x, y, zoom)

	return c.sendSOAP(soap)
}

// Stop stops any ongoing PTZ movement.
func (c *ONVIFClient) Stop() error {
	soap := `
		<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:tptz="http://www.onvif.org/ver20/ptz/wsdl">
			<s:Body>
				<tptz:Stop>
					<tptz:ProfileToken>ProfileToken_1</tptz:ProfileToken>
					<tptz:PanTilt>true</tptz:PanTilt>
					<tptz:Zoom>true</tptz:Zoom>
				</tptz:Stop>
			</s:Body>
		</s:Envelope>`

	return c.sendSOAP(soap)
}

func (c *ONVIFClient) sendSOAP(payload string) error {
	client := &http.Client{Timeout: 5 * time.Second}
	req, err := http.NewRequest("POST", c.Endpoint, bytes.NewBufferString(payload))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/soap+xml; charset=utf-8")
	// TODO: Add WS-Security authentication header if required by camera

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("ONVIF SOAP request failed with status: %s", resp.Status)
	}

	return nil
}
