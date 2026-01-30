# **SENTgrid – Network Automation & Topology**

**Division:** SENTerp (Infrastructure)  
**Architecture:** NetOps & Automation Engine  
**Status:** [GOLD_MASTER_READY]

## **1. Executive Summary**

SENTgrid is the "Map of the Territory". It visualizes the physical and logical network topology, detecting devices via LLDP/CDP crawling. It goes beyond monitoring by offering "Configuration Drift Detection" – identifying when a device's config changes from the known-good baseline.

## **2. Core Features**

### **2.1 Topology Mapping**

- **Visual Map:** Interactive graph of switches, routers, and endpoints (`TopologyMap`).
- **Status Indicators:** Color-coded badges for device health (Online, Offline, Drift).
- **Port Grid:** Visual 48-port switch faceplate to see port status (Up/Down/PoE) at a glance.

### **2.2 Configuration Governance**

- **Drift Engine:** Compares the live running-config vs. the stored startup-config (or golden image).
- **Diff Viewer:** Highlights added (`+`) or removed (`-`) lines in configuration files (e.g., changed routes or VLANs).

### **2.3 Security Integration**

- **Lateral Movement Detection:** Visual alerts when SENTreflex detects suspicious MAC address movement between switch ports.
- **Quarantine:** One-click execution to shut down a switch port hosting a compromised device.

## **3. Integration with SENT Ecosystem**

- **SENTreflex:** The "Brain" that tells SENTgrid what to block.
- **SENTcontrol:** Uses SENTgrid flow logs to find Shadow IT applications.
- **SENTpulse:** Maps endpoints (Agents) to specific switch ports in the Grid.

## **4. Future Roadmap**

- **Auto-Healing:** Automatically revert config changes that weren't approved via a Change Request ticket.
- **Firmware Orchestration:** Bulk update IOS/firmware on switches during maintenance windows.
