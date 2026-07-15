# Communication Protocol & State Synchronization

**Last Updated:** July 16, 2026

This directory contains specifications and definitions for communication between the **React Native App**, the **FastAPI Fleet Orchestrator (Backend)**, and the **Vehicle Clients**.

## Current Protocol State
As of the current implementation, the React Native application primarily communicates directly with **Firebase Firestore**. 
The real-time elements (like notifications and ecosystem updates) are handled via Firestore `onSnapshot` listeners.

### 1. App-to-Firestore Sync
- **User State:** Fetched from `users/{uid}`.
- **Ecosystem & Network State:** Fetched from `ecosystems/{ecoCode}`. The app embeds `users` and `networks` heavily within the single ecosystem document to minimize read costs and latency for small fleets.
- **Notifications:** Stored in the subcollection `users/{uid}/notifications`. The app listens to this in real-time.

### 2. Future Protocol Integrations (Pending Backend Wiring)
Once the FastAPI Fleet Orchestrator and hardware vehicles are integrated, the following protocols will be formalized here:

- **WebSocket (App ↔ Backend):**
  - **Telemetry Streaming:** The backend will stream live vehicle coordinates and sensor data to the app via WebSockets.
  - **Manual Control:** The app will send high-frequency control packets (joystick/d-pad) directly to the backend over WebSocket for low-latency relay to the vehicle.
  
- **REST (App → Backend):**
  - **Task Dispatch:** Complex task generation, destination routing, and fleet arbitration will be requested via REST endpoints, allowing the backend to synchronously calculate routes and ETAs before confirming.

### 3. Folder Structure
- `messages/` (To be created) - Definitions for JSON payloads sent over WebSockets.
- `endpoints/` (To be created) - Standardized REST endpoint definitions for App-Backend communication.

*Please keep this documentation updated as the backend and hardware layers are actively wired to the React Native client.*
