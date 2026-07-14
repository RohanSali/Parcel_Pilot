# Parcel Pilot Architecture Addendum (Post SRS v1.0)

> **Purpose**
>
> This document records all architectural decisions, refinements, and
> clarifications agreed **after** the frozen SRS v1.0. It is intended to
> be read alongside the SRS and does **not** replace it.

------------------------------------------------------------------------

# 1. Backend Technology

## Final Decision

The backend will be implemented entirely in **Python** using
**FastAPI**.

Reasons:

-   Native async support
-   REST + WebSocket support
-   Easy integration with Firebase Admin SDK
-   Shares ecosystem with RL implementation
-   Easy deployment using Docker/Uvicorn
-   Clean modular architecture

The backend is **not** merely a request proxy. It acts as the **Fleet
Orchestrator**.

------------------------------------------------------------------------

# 2. Revised System Architecture

    React Native App
    (UI + Firebase Auth + Firestore)

            │
    REST + WebSocket
            │

    FastAPI Fleet Orchestrator

    ├── Vehicle Manager
    ├── Fleet Manager
    ├── Driver / RL Engine
    └── State Synchronization

            │

    Vehicle Communication Layer

            │

     ┌───────────────┬────────────────┐
     │               │
    Unity Client   Arduino Client

------------------------------------------------------------------------

# 3. Backend Responsibilities

The FastAPI backend owns:

-   Vehicle connection management
-   WebSocket server
-   Driver / RL inference
-   Fleet orchestration
-   Vehicle request arbitration
-   ETA calculation
-   Manual control sessions
-   Command dispatch
-   Telemetry broadcast
-   Vehicle heartbeat monitoring
-   Event persistence
-   Firestore synchronization where required

The backend **does not replace Firebase Authentication or Firestore.**

------------------------------------------------------------------------

# 4. Firebase Responsibilities

Firebase Authentication remains the authentication provider.

The React Native application continues to authenticate users directly
using Firebase.

Firestore remains the persistent source of truth for:

-   Users
-   Networks
-   Vehicles
-   Tasks
-   Maps
-   Roles
-   History
-   Notifications
-   Analytics
-   Activity Feed

The application should read most business data directly from Firestore.

FastAPI should only be involved when orchestration, realtime
communication or autonomous decision making is required.

------------------------------------------------------------------------

# 5. Vehicle Philosophy

The backend never distinguishes between simulator and physical hardware.

Every connected entity is simply a **Vehicle Client**.

Examples:

-   Unity Simulation
-   Arduino Vehicle
-   Future ESP32
-   Future Raspberry Pi

All implement the same communication protocol.

No "isSimulator" branching should exist inside backend business logic.

------------------------------------------------------------------------

# 6. Vehicle Responsibilities

Vehicle Clients are intentionally lightweight.

Responsibilities:

-   Execute movement commands
-   Read sensors
-   Motor control
-   Encoder reading
-   Telemetry generation
-   Heartbeat
-   Command acknowledgement

Vehicle Clients should NOT contain:

-   Fleet management
-   Request arbitration
-   Task scheduling
-   User logic
-   RL
-   Path planning
-   ETA calculation

------------------------------------------------------------------------

# 7. Driver / RL

## V1 Decision

Because Arduino Uno cannot execute modern RL or planning algorithms, all
intelligence executes inside FastAPI.

Training lives in:

    root/rl/

Inference lives inside:

    root/backend/

The backend converts high-level objectives into low-level vehicle
commands.

Example:

Task → Destination → Planner → Driver → Vehicle Commands

------------------------------------------------------------------------

# 8. Fleet Manager

A Fleet Manager module is introduced.

Responsibilities:

-   Vehicle allocation
-   Vehicle request handling
-   Queue management
-   Vehicle availability
-   ETA calculation
-   Arbitration
-   Request acceptance logic
-   Manual control preemption

------------------------------------------------------------------------

# 9. User Interaction Model

Users do NOT control vehicles directly.

Users can:

-   Request nearest available vehicle
-   Request a specific vehicle
-   Create tasks
-   Monitor fleet state
-   Observe telemetry
-   Observe task progress

Vehicles operate autonomously.

------------------------------------------------------------------------

# 10. Vehicle Request Flow

Nearest Vehicle Request

User → Backend → Fleet Manager → Best Vehicle selected → Driver →
Vehicle

Specific Vehicle Request

User → Backend → Fleet Manager → Driver evaluates current route → Accept
or Reject with ETA → Response returned

Acceptance logic executes in backend.

------------------------------------------------------------------------

# 11. Manual Control

Only Admin users may enter Manual Control.

Manual Control has highest priority.

When Manual Control begins:

-   Autonomous execution pauses immediately
-   Current driver relinquishes control
-   Backend grants exclusive session
-   Commands originate only from admin

When Manual Control ends:

-   Driver resumes previous operation if possible

Manual Control is backend-controlled.

------------------------------------------------------------------------

# 12. Application Responsibilities

React Native is responsible for:

-   UI
-   Authentication flow
-   Firestore reads
-   Local validation
-   Vehicle visualization
-   Maps
-   Task creation
-   Sending requests
-   Displaying telemetry

The application does not make fleet decisions.

------------------------------------------------------------------------

# 13. Communication Protocol

Exactly one protocol exists.

Every Vehicle Client implements:

-   Register
-   Heartbeat
-   Telemetry
-   Event
-   Command Acknowledgement

Packet structure remains identical regardless of implementation.

------------------------------------------------------------------------

# 14. Vehicle Identity

Every vehicle owns two identifiers.

Hardware Identity

Examples:

-   Bluetooth MAC
-   MCU Chip ID
-   Device Serial

Application Identity

Vehicle UUID

Application logic always references the Vehicle UUID.

Hardware IDs are used only during registration and pairing.

------------------------------------------------------------------------

# 15. Repository Structure

    root/

    application/
    └── ParcelPilotApp/

    backend/

    firmware/

    rl/

    simulation/
    └── unity/

    shared/

    infra/

    tools/

------------------------------------------------------------------------

## application/

React Native application.

------------------------------------------------------------------------

## backend/

FastAPI Fleet Orchestrator.

Suggested domains:

-   communication/
-   vehicles/
-   fleet/
-   driver/
-   tasks/
-   maps/
-   notifications/
-   users/

Avoid organizing primarily by technologies.

------------------------------------------------------------------------

## firmware/

Vehicle firmware.

Example:

arduino/

shared/

------------------------------------------------------------------------

## rl/

Contains only:

-   training
-   datasets
-   experiments
-   notebooks

No runtime inference.

------------------------------------------------------------------------

## simulation/

Unity project.

Unity acts only as a Vehicle Client.

------------------------------------------------------------------------

## shared/

Recommended project-wide contract.

Suggested contents:

protocol/ schemas/ constants/ docs/

Stores protocol definitions, packet schemas and shared specifications.

------------------------------------------------------------------------

## infra/

Deployment assets.

Examples:

-   Dockerfiles
-   docker-compose
-   deployment scripts

------------------------------------------------------------------------

## tools/

Developer utilities.

------------------------------------------------------------------------

# 16. Logging

Structured logging should exist from the beginning.

Important events include:

-   Vehicle Connected
-   Vehicle Disconnected
-   Task Assigned
-   Task Accepted
-   Task Completed
-   Task Failed
-   Vehicle Requested
-   Manual Control Started
-   Manual Control Ended
-   Emergency Stop
-   Battery Low

------------------------------------------------------------------------

# 17. Configuration

Backend configuration should use environment variables and separated
runtime configurations.

Avoid hardcoded values.

------------------------------------------------------------------------

# 18. Architectural Principles

1.  Backend is the Fleet Orchestrator.
2.  Firestore is the persistent source of truth.
3.  Firebase Authentication remains the authentication provider.
4.  React Native is responsible for presentation and user interaction.
5.  Backend owns autonomous decision making.
6.  Vehicles remain lightweight execution devices.
7.  Simulator and hardware are treated identically.
8.  One protocol for every vehicle implementation.
9.  Training and inference remain separated.
10. Modular design is preferred over technology-centric organization.
