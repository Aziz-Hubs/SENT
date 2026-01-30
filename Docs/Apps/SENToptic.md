# **SENToptic – Surveillance NVR & AI Inference**

**Division:** SENTsec (Security)  
**Architecture:** Video Management System (VMS)  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENToptic is a browser-based Network Video Recorder (NVR) and AI Inference dashboard. It connects to IP cameras (ONVIF/RTSP), provides live low-latency streaming, and aggregates AI-detected events (like "Person Detected") into a searchable timeline.

## **2. Core Features**

### **2.1 Live Monitoring**

- **Matrix View:** Grid layout for monitoring multiple camera streams simultaneously.
- **Low Latency:** WebRTC/MSE streaming for sub-second latency on LAN.
- **Health Monitoring:** Real-time status checks (Online/Offline, Latency in ms).

### **2.2 PTZ Control (Pan-Tilt-Zoom)**

- **Soft Joystick:** On-screen controls for PTZ-enabled cameras.
- **Click-to-Center:** Click anywhere on the video feed to center the camera on that point (requires calibrated PTZ).
- **Auto-Track:** (Simulated) Toggle to enable motion tracking.

### **2.3 AI & Forensics**

- **Inference Stream:** A real-time log of computer vision events (e.g., "Person Detected", "Vehicle License Plate").
- **Visual Forensics:** Interactive charts showing event density over time (e.g., "Spike in motion events at 2:00 AM").
- **ROI Search:** (Concept) Draw a box on the screen to search for motion in that specific area.

## **3. Integration with SENT Ecosystem**

- **SENTvault:** Video clips tagged as "Evidence" are offloaded to the Vault for immutable storage.
- **SENTguard:** If a camera detects a "Breach", SENTguard can lock down doors or alert security teams.
- **SENTgrid:** IoT VLAN management for isolating camera traffic.

## **4. Deployment Strategy**

- **Tier 1 Storage:** Local loop recording (7 days) on the NVR edge device.
- **Tier 2 Storage:** Cloud/Vault archival for critical events.
