// SENTmsp Feature Package Public API
// This package contains MSP-specific business logic and components

export * from "./sent-msp-pulse";
export * from "./types";
export { pulseService as rmmService, agentClient } from "./services/pulse-client";
// export * from "./services/mock-rmm"; // Mock service disabled
export {
    Device as ProtoDevice,
    DeviceStatus as ProtoDeviceStatus,
    DeviceType as ProtoDeviceType,
    OS as ProtoOS
} from "./gen/sentpulse/v1/pulse_pb";
export { default as Terminal } from "./components/Terminal/Terminal";
