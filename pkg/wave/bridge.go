package wave

import (
	"context"

	"sent/ent"
	"sent/ent/calllog"
	"sent/pkg/wave/ivr"
	"sent/pkg/wave/rtc"
	"sent/pkg/wave/signaling"
)

// WaveBridge provides VoIP functionalities to the Wails frontend.
type WaveBridge struct {
	ctx       context.Context
	db        *ent.Client
	rtc       *rtc.Engine
	signaling *signaling.Service
	ivr       *ivr.Engine
}

// NewWaveBridge initializes a new WaveBridge.
func NewWaveBridge(db *ent.Client) *WaveBridge {
	return &WaveBridge{
		db:        db,
		rtc:       rtc.NewEngine(),
		signaling: signaling.NewService(),
		ivr:       ivr.NewEngine(db),
	}
}

// Startup initializes the bridge with the Wails context.
func (b *WaveBridge) Startup(ctx context.Context) {
	b.ctx = ctx
}

// InitiateCall starts a new outgoing call.
func (b *WaveBridge) InitiateCall(target string) (string, error) {
	// 1. Create PeerConnection
	// 2. Create Offer
	// 3. Send SIP INVITE
	return "call-id-123", nil
}

// Hangup terminates an active call.
func (b *WaveBridge) Hangup(callID string) error {
	return b.signaling.Hangup(b.ctx, callID)
}

// GetCallLogs retrieves call history for the current tenant.
func (b *WaveBridge) GetCallLogs() ([]*ent.CallLog, error) {
	return b.db.CallLog.Query().
		Order(ent.Desc(calllog.FieldStartTime)).
		All(b.ctx)
}

// SaveIVRFlow saves or updates an IVR flow DAG.
func (b *WaveBridge) SaveIVRFlow(name string, nodes map[string]interface{}, edges map[string]interface{}) (*ent.IVRFlow, error) {
	// Logic to save IVR flow
	return nil, nil
}
