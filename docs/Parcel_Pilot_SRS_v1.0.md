# PARCEL PILOT
## Parcel Pilot Interface
### Software Requirements Specification & System Design Document

**Version:** 1.0 (Frozen Baseline)
**Document Classification:** Internal / Project Baseline
**Date:** 12 July 2026
**Stack:** Fleet-Centric Architecture · Firebase Firestore · React Native (TypeScript) · Arduino Uno · Python RL Engine

---

## Table of Contents

1. [Revision History](#1-revision-history)
2. [Introduction](#2-introduction)
3. [Vision & Objectives](#3-vision--objectives)
4. [System Overview](#4-system-overview)
5. [Functional Requirements](#5-functional-requirements)
6. [User Roles & Permission Model](#6-user-roles--permission-model)
7. [Fleet & Network Management](#7-fleet--network-management)
8. [Task Management](#8-task-management)
9. [Map Management](#9-map-management)
10. [Vehicle Management](#10-vehicle-management)
11. [Communication & Notifications](#11-communication--notifications)
12. [Firebase Data Model](#12-firebase-data-model)
13. [Screen Specifications](#13-screen-specifications)
14. [UI/UX Guidelines](#14-uiux-guidelines)
15. [System Workflows](#15-system-workflows)
16. [Non-Functional Requirements](#16-non-functional-requirements)
17. [Security Requirements](#17-security-requirements)
18. [Future Roadmap](#18-future-roadmap)
19. [Appendices](#19-appendices)

---

## 1. Revision History

This document is maintained as the single source of truth for Parcel Pilot's functional and technical scope. All future changes must be logged below with a version increment; no silent edits to a frozen baseline are permitted.

| Version | Date | Author | Description of Change |
|---|---|---|---|
| 0.1 | — | Product Owner | Initial vehicle-centric concept (single vehicle controller) |
| 0.5 | — | Product Owner | Introduced Network as top-level entity; fleet-centric pivot |
| 0.8 | — | Product Owner | RBAC, task lifecycle, map versioning, Firestore decisions finalized |
| 1.0 | 12 Jul 2026 | Product Owner | Baseline frozen. UUID strategy and common entity metadata standardized. |

> **Note:** This SRS is intentionally structured to be implementation-ready: every functional statement in this document is expected to map directly to a Firestore collection, a screen, or a backend endpoint.

---

## 2. Introduction

### 2.1 Purpose

This Software Requirements Specification (SRS) defines the complete functional, architectural, and non-functional requirements for Parcel Pilot, an application ("Parcel Pilot Interface") that allows human users to interact with real or simulated autonomous vehicles operating within an industrial or warehouse environment. The document is the authoritative reference for design, development, quality assurance, and future maintenance of the system, and is intended to be frozen as Version 1.0 before implementation begins in Antigravity.

### 2.2 Scope

Parcel Pilot is a fleet-centric, multi-tenant platform that lets organizations ("Networks") register autonomous or semi-autonomous vehicles, organize users under role-based permissions, assign delivery/transport tasks to vehicles, maintain a live and historical map of vehicle activity, and observe a shared activity feed of everything happening inside the network. The system is composed of three cooperating parts:

- A React Native (TypeScript) mobile application for Android and tablets — the Parcel Pilot Interface.
- A backend service (deployed on Render) that mediates all communication between the application, Firebase, and vehicles.
- Vehicle firmware and an out-of-scope Reinforcement Learning (RL) engine, written in Python, that provides autonomous navigation, obstacle avoidance, and task optimization. The RL/path-planning intelligence itself is explicitly outside the scope of this SRS; the application only issues commands and displays vehicle state.

The vehicle hardware target for the initial release is an Arduino Uno equipped with Bluetooth and/or WiFi connectivity, GPS, and a set of sensors (initially IR and UV, designed for future expansion). Vehicles may be physical or fully simulated, with the application treating both identically at the interface level.

### 2.3 Intended Audience

- Product Owner / Founder — for scope validation and prioritization.
- Mobile developers (React Native / TypeScript) building the Parcel Pilot Interface.
- Backend developers building the Render-hosted mediation service and Firebase security rules.
- RL/robotics engineers building vehicle intelligence, consuming this SRS only for the command/state contract exposed by the app.
- QA engineers deriving test cases and acceptance criteria.

### 2.4 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|---|---|
| SuperAdmin | The single, system-wide owning entity of a Network. Has unrestricted access across all networks in the system. |
| Admin | A user granted administrative permissions inside one or more Networks; multiple Admins may exist per Network. |
| Operator / User | A general member of a Network whose capabilities are defined entirely by the permissions attached to their assigned Role. |
| Network | The top-level tenant entity. Owns Users, Vehicles, one Map, Tasks, Activity Feed, and Messaging. |
| Ecosystem | The global pool of vehicles owned by a SuperAdmin, before or between Network assignment. |
| Fleet | The set of vehicles currently assigned to a given Network. |
| Task | A unit of work created by a User, owned conceptually by the Network, and assigned to a Vehicle for execution. |
| Vehicle Mode | The vehicle's operating paradigm (e.g., Autonomous, Manual/Remote-Controlled). |
| Vehicle State | The vehicle's current real-time condition (e.g., Idle, Moving, Error), independent of Mode. |
| RBAC | Role-Based Access Control, implemented internally as permission-based roles. |
| RL | Reinforcement Learning — the Python-based intelligence layer that plans vehicle paths and task execution outside this application. |
| UUID | Universally Unique Identifier, generated for every major entity independent of the Firestore document ID. |

### 2.5 References

- Project working notes and requirements Q&A sessions (Sessions 1 and 2), 2026.
- Firebase Firestore and Firebase Authentication official documentation.
- React Native and TypeScript official documentation.

---

## 3. Vision & Objectives

### 3.1 Vision Statement

Parcel Pilot exists to make it trivially easy for any organization to operate a small fleet of autonomous transport vehicles inside a facility — calling a vehicle, loading it, sending it to a destination, and trusting the system to coordinate everything from access control to task history — while the actual navigation intelligence is free to evolve independently as a pluggable Reinforcement Learning engine.

### 3.2 Project Objectives

1. Deliver a fleet-centric mobile application (Android + tablet) that supports multiple Networks, multiple Vehicles, and multiple concurrent Users, all sharing full visibility of one another's actions within a Network (no abstraction between peers).
2. Implement an Admin-configurable, permission-based RBAC system so that organizations can define exactly what each class of user may do, rather than relying on fixed hardcoded roles.
3. Provide a complete Task lifecycle — creation, prioritization, assignment, execution tracking, cancellation, and failure handling — that gives operators confidence in what every vehicle is doing at all times.
4. Provide an extensible Map system that supports both Admin-authored maps and vehicle-discovered/updated maps, generic map objects, restricted zones, and version history with rollback.
5. Support both fully autonomous and manual/remote-controlled vehicle operation, using a defined command system rather than raw movement signals.
6. Keep the RL / path-planning / obstacle-avoidance intelligence entirely outside the application boundary, communicating only through a stable command and telemetry contract.
7. Build on Firebase (Authentication + Cloud Firestore) with a backend mediation layer on Render, using globally unique IDs and standardized metadata across all entities to keep the system portable and auditable.
8. Use this SRS as the single blueprint feeding mobile development (Antigravity/React Native), backend development, and the Python RL engine, so all three tracks stay consistent as they are built incrementally.

### 3.3 Success Criteria for Version 1.0

- A SuperAdmin can create a Network, and an Admin inside it can register a vehicle, build/edit a map, define roles, and invite users.
- A User can call a vehicle, load it (conceptually, via the app), assign a drop location, and track the task through its full lifecycle to completion, with all other Network members seeing the same activity feed.
- A vehicle can operate in both Autonomous and Manual modes, report meaningful state changes, and gracefully fail a task on disconnection or battery loss.
- The system supports Dark and Light themes, works fully offline-tolerant for Bluetooth-only manual control (per the offline policy defined in Section 15), and enforces permission checks on every sensitive action.

---

## 4. System Overview

### 4.1 High-Level Architecture

Parcel Pilot follows a three-tier architecture: a React Native client, a Render-hosted backend mediation service, and Firebase (Authentication + Firestore) as the system of record. Vehicles communicate through the backend for registration, task assignment, and network messaging, and may also communicate directly with the phone over Bluetooth/WiFi for low-latency manual control and telemetry, per the Communication Protocol defined in Section 11.

| Layer | Technology | Responsibility |
|---|---|---|
| Client | React Native + TypeScript (Android, Tablet) | All user-facing screens; renders Dark/Light themed, role-aware UI; issues commands; displays live + historical state. |
| Backend | Node/Render-hosted service | Mediates app ↔ Firebase ↔ vehicle communication; enforces business rules not expressible in Firestore Security Rules; manages broadcast messaging and notification fan-out. |
| Data & Auth | Firebase Authentication (Google Sign-In) + Cloud Firestore | System of record for Users, Networks, Vehicles, Tasks, Maps, Roles, Activity, Notifications; enforces RBAC via Security Rules. |
| Vehicle | Arduino Uno (real) or Simulator | Executes commands, reports sensor/telemetry/state data, connects via Bluetooth/WiFi; hosts the RL/path-planning logic (Python), which is out of scope for this SRS. |

### 4.2 Entity Hierarchy

The system is organized around Networks as the top-level tenant, per the fleet-centric pivot agreed during requirements gathering:

```
System
├── Users            (global identity, may belong to many Networks)
├── Vehicles         (global Ecosystem pool, owned by SuperAdmin)
└── Networks         (the operational tenant)
    ├── Users            (network membership + role)
    ├── Vehicles         (currently assigned; one Network at a time)
    ├── Map              (exactly one per Network, versioned)
    ├── Tasks            (owned by the Network, created by a User)
    ├── Activity Feed    (Admin-visible timeline)
    └── Messaging        (broadcast group, auto-created per Network)
```

### 4.3 Ownership Model

- Exactly one SuperAdmin exists as the ultimate owner of the system and of every Network (single entity per network's ownership root, matching the approved answer: "network will belong to SuperAdmin").
- Each Network may have multiple Admins, who together with regular Users are members of the Network alongside its Vehicles.
- A Vehicle, once paired, becomes part of the SuperAdmin's global Ecosystem and can then be assigned by any Admin to any Network. A Vehicle belongs to exactly one Network at a time.
- A User account is global and may belong to many Networks, but is active in only one Network at a time (per the locked decision list).

### 4.4 Key Non-Goals (Explicitly Out of Scope)

- Path-planning, obstacle avoidance, and task-optimization intelligence (the RL engine) — the application only sends commands and receives state/telemetry.
- The real-world negotiation between vehicles over which one accepts a "call" request — handled outside the application by the vehicle/RL layer; the application is only responsible for detecting and resolving deadlock conditions at the request level.
- Physical fleet dispatch hardware beyond the Arduino Uno target for V1.

---

## 5. Functional Requirements

Each requirement below is uniquely identified (FR-n) for traceability into test cases, backend endpoints, and Firestore rules. Requirements are grouped conceptually in Sections 6–11 but listed here as the master, numbered list for sign-off.

| ID | Requirement |
|---|---|
| FR-1 | The system shall allow a SuperAdmin to create and own Networks. |
| FR-2 | The system shall allow an Admin to invite Users to a Network and assign them a Role. |
| FR-3 | The system shall allow a User to belong to multiple Networks but be active in only one at a time, with an explicit network-switch action. |
| FR-4 | The system shall allow an Admin to register a new Vehicle by capturing its unique hardware identifier (e.g., Bluetooth ID), pairing it, and adding it to the SuperAdmin's Ecosystem, without requiring SuperAdmin approval. |
| FR-5 | The system shall allow any Admin to assign an Ecosystem Vehicle to their Network, provided the Vehicle is not already assigned elsewhere. |
| FR-6 | The system shall allow a User to "call" a Vehicle to their location; if the Vehicle is busy, the system shall surface an ETA and allow the Vehicle/RL layer to accept or defer the request. |
| FR-7 | The system shall allow a User to request the nearest/most optimal free Vehicle without naming one explicitly, with final acceptance logic handled outside the application, and deadlock conditions detected and resolved by the application. |
| FR-8 | The system shall allow a User to create a Task specifying items and a drop-off location, assign it to a Vehicle, and have it stored against the Network. |
| FR-9 | The system shall support Task priorities (Critical, High, Normal, Low) with access to set priority controlled by Admin-defined permissions. |
| FR-10 | The system shall allow Task cancellation by the task creator, Admins, and SuperAdmin by default, with further access controlled by Admin-defined permissions. |
| FR-11 | The system shall transition a Task to Failed when the assigned Vehicle experiences a failure (battery loss, disconnect, or physical obstruction) during execution. |
| FR-12 | The system shall support exactly one Map per Network, with full version history and rollback. |
| FR-13 | The system shall represent Map content as generic, extensible Map Objects (walls, obstacles, restricted areas, pickup/drop points, charging docks, etc.) rather than hardcoded geometry types. |
| FR-14 | The system shall allow Admins (and permitted Users) to edit the Network map, and shall allow the Vehicle to autonomously update its own memory map based on its actions. |
| FR-15 | The system shall allow designation of restricted/no-go locations on the map. |
| FR-16 | The system shall support both Autonomous and Manual/Remote-controlled Vehicle Modes, gated by Vehicle-level role permissions. |
| FR-17 | The system shall expose Vehicle control as a defined Command system (Move, Stop, Pause, Resume, Return Home, Emergency Stop, Manual Override, Blink Indicator, Custom Command) rather than raw directional signals. |
| FR-18 | The system shall track Vehicle State (Online, Offline, Busy, Idle, Moving, Waiting, Disconnected, Error) independently from Vehicle Mode (Autonomous, Manual). |
| FR-19 | The system shall record Home, Charging, and Parking positions per Vehicle to support a Return-Home command. |
| FR-20 | The system shall maintain Vehicle History: task history, travel history, distance travelled, battery usage, manual control sessions, and errors, with Admin-facing analytics/dashboards built on top of this history. |
| FR-21 | The system shall support an expandable Sensor system (initially IR and UV) with a dynamic UI that does not hardcode sensor types. |
| FR-22 | The system shall maintain a per-Network Activity Feed (timestamped events), visible to Admins only. |
| FR-23 | The system shall support Network-wide broadcast messaging: every Network automatically has one broadcast group; a message sent reaches all Users and Admins in that Network. |
| FR-24 | The system shall categorize notifications as System, Fleet, Task, Vehicle, Network, and Security for filtering. |
| FR-25 | The system shall support Dark and Light themes, user-selectable from a Settings screen that also hosts profile management. |
| FR-26 | The system shall implement permission-based RBAC: Admins compose Roles from a fixed catalogue of Permissions rather than the system hardcoding named roles such as "Operator". |
| FR-27 | The system shall allow the SuperAdmin unrestricted access: view every Network, edit every map, remove any Admin, delete any Network, and transfer Network ownership. |
| FR-28 | The system shall assign a globally unique UUID to every major entity (Network, Vehicle, Task, Map, User, Role, Permission, Activity, Notification), independent of the Firestore document ID. |
| FR-29 | The system shall attach standardized metadata (createdAt, createdBy, updatedAt, updatedBy, isDeleted, status, version) to every major entity. |
| FR-30 | When internet connectivity is lost, the system shall stop all operation (no offline Bluetooth-only manual control fallback), per the approved offline policy. |

---

## 6. User Roles & Permission Model

### 6.1 Design Principle

Rather than hardcoding named roles such as "Operator" or "Admin" into application logic, Parcel Pilot implements permission-based RBAC internally. A Role is simply a named collection of Permissions; Admins create Roles by selecting from a fixed system-defined Permission catalogue and assigning that Role to Users. This mirrors standard enterprise RBAC design and lets each Network tailor access without any code change.

### 6.2 Standing Roles

| Role | Scope | Notes |
|---|---|---|
| SuperAdmin | System-wide | Single entity; owns every Network; implicitly holds all Permissions everywhere; can view every Network, edit every map, remove any Admin, delete any Network, and transfer Network ownership. |
| Admin | Per Network | Multiple Admins per Network; created with a broad default Permission set that can be customized; can create further custom Roles. |
| Custom Role (e.g., Operator) | Per Network | Fully defined by the Admin from the Permission catalogue; not hardcoded by the system. |

### 6.3 Permission Catalogue (V1.0)

| Permission Key | Description |
|---|---|
| canAssignTask | Create or assign a Task to a Vehicle. |
| canCancelTask | Cancel an existing Task. |
| canSetTaskPriority | Set or change a Task's priority level. |
| canEditMap | Modify Map Objects on the Network's Map. |
| canPublishMapVersion | Save a new Map version (creates a version snapshot). |
| canRollbackMap | Restore a previous Map version. |
| canRegisterVehicle | Add a new Vehicle to the SuperAdmin Ecosystem. |
| canAssignVehicle | Assign an Ecosystem Vehicle to this Network. |
| canManualControl | Take manual/remote control of a Vehicle. |
| canViewAnalytics | View Vehicle/Task/Network analytics dashboards. |
| canEditNetwork | Edit Network settings/metadata. |
| canInviteUsers | Invite new Users into the Network. |
| canCreateUsers | Create user accounts directly within the Network. |
| canDeleteUsers | Remove Users from the Network. |
| canCreateRoles | Create or edit custom Roles and their Permissions. |
| canViewActivityFeed | View the Network's Activity Feed. |
| canBroadcastMessage | Send a broadcast message to the Network group. |
| canManageNotificationSettings | Configure notification categories/routing for the Network. |

### 6.4 RBAC Data Relationship

Conceptually: a Role document holds an array of Permission keys; a User's membership record within a Network references exactly one Role (per Network — the same User may hold a different Role in a different Network, consistent with "active in only one Network at a time").

### 6.5 Default Behavior

- Task cancellation is permitted by default for the task's creator, any Admin, and the SuperAdmin; broader access is governed by canCancelTask for custom Roles.
- Vehicle registration requires canRegisterVehicle; no SuperAdmin approval step is required post-registration.
- Activity Feed and Analytics are Admin-only by default (canViewActivityFeed, canViewAnalytics), extendable to other Roles at the Admin's discretion.

---

## 7. Fleet & Network Management

### 7.1 Network Lifecycle

- Creation — a SuperAdmin creates a Network; the Network is assigned a UUID and standard metadata.
- Population — the SuperAdmin or an Admin invites Users and assigns Vehicles from the Ecosystem.
- Operation — Users interact with Vehicles, Tasks, Maps, Messaging, and the Activity Feed within the Network.
- Archival/Deletion — a SuperAdmin may delete a Network; deletion is modeled as a soft delete (isDeleted = true, status updated) to preserve audit history.

### 7.2 Vehicle Registration Workflow

Vehicle onboarding is Admin-initiated and does not require SuperAdmin approval:

1. Admin adds a Vehicle to the system using its unique hardware identifier (Bluetooth ID).
2. Application pairs and connects to the Vehicle to confirm it is reachable.
3. On successful connection, the Vehicle becomes part of the SuperAdmin's global Ecosystem.
4. Any Admin (with canAssignVehicle) may then assign the Vehicle to a Network. A Vehicle is a member of exactly one Network at a time.
5. A Vehicle may be assigned tasks and participate in general Network operations even while powered off; execution simply waits until it powers on and reconnects.

### 7.3 Vehicle Availability & Session Handling

- Multiple Users within a Network may attempt to assign Tasks to the same Vehicle; the Vehicle/queueing layer determines execution order.
- If a User calls a specific Vehicle that is currently occupied, the system surfaces an estimated time until the Vehicle can respond; if the User remains "on the way," the Vehicle (via its out-of-application logic) may still accept the request.
- If a User requests the nearest/most optimal free Vehicle, that selection is resolved outside the application (vehicle/RL layer), but the application is responsible for detecting and breaking any deadlock (e.g., two Vehicles both electing to defer, or two requests racing for the same Vehicle) so the User is never left without a resolution.

### 7.4 Multi-User Shared Visibility

Parcel Pilot deliberately keeps no abstraction between peers: all Users within a Network can see all other Users' actions on Vehicles and Tasks, reinforced by the shared, Admin-visible Activity Feed and the Network-wide broadcast channel.

---

## 8. Task Management

### 8.1 Task Ownership Model

A Task is created by a User, assigned to a Vehicle, and stored inside the Network — ownership for access-control purposes rests with the Network, while authorship (creator) is retained for cancellation-permission checks and history.

### 8.2 Task Lifecycle

| State | Description |
|---|---|
| Created | Task recorded, not yet queued for execution. |
| Queued | Task waiting for a Vehicle to become available. |
| Accepted | A Vehicle (or the assignment logic) has accepted the Task. |
| Vehicle Assigned | A specific Vehicle is bound to the Task. |
| Vehicle Moving | Vehicle en route to the pickup point. |
| Loading | Items are being placed onto/into the Vehicle. |
| Transporting | Vehicle en route to the drop-off point. |
| Unloading | Items are being removed at the destination. |
| Completed | Task finished successfully. |
| Failed | Task terminated due to a Vehicle failure (battery, disconnect, obstruction). |
| Cancelled | Task terminated by an authorized User/Admin/SuperAdmin. |
| Expired | Task exceeded an allowed time window without progressing. |

Failure branches (Failed, Cancelled, Expired) may be entered from any active state. On Vehicle failure specifically, V1.0 always transitions the Task straight to Failed (no automatic Pause/Retry loop in this release).

### 8.3 Task Priority

Tasks support four priority levels — Critical, High, Normal, Low — used to order the execution queue when multiple Tasks are pending against the same or overlapping Vehicles. The ability to set a non-default priority is itself an Admin-configurable permission (canSetTaskPriority).

### 8.4 Task Cancellation Rules

- By default: the Task's creator, any Admin, and the SuperAdmin may cancel a Task.
- Additional Users may be granted cancellation rights via canCancelTask on their assigned Role.

### 8.5 Vehicle Failure Handling

For V1.0, any of the following conditions during Task execution — battery depletion, Bluetooth/WiFi disconnection, or the Vehicle becoming physically stuck — results in the Task being marked Failed. The Activity Feed and Vehicle History both record the failure event and its cause for later analysis.

---

## 9. Map Management

### 9.1 Cardinality

Each Network owns exactly one Map. The Map is the shared spatial reference used for Vehicle navigation, restricted zones, and points of interest.

### 9.2 Generic Map Objects

Rather than hardcoding types like "wall" or "danger zone," every placed item on the Map is a generic Map Object with the following structure:

| Field | Description |
|---|---|
| objectId | UUID for the object. |
| name | Human-readable label. |
| category | One of: Wall, Obstacle, Restricted Area, Ramp, Pickup Point, Drop Point, Charging Dock, Danger Zone, Decoration, Custom. |
| geometry | Shape/points describing the object's footprint. |
| rotation | Orientation in degrees. |
| color | Display color. |
| properties | Free-form key/value bag for category-specific attributes. |

### 9.3 Map Versioning

Every save of the Map creates a new immutable version (v1, v2, v3, …). Admins (or Users with canRollbackMap) can restore any previous version, protecting the Network from accidental map corruption. Version metadata reuses the standard entity metadata fields (createdAt, createdBy, version).

### 9.4 Map Authoring vs. Vehicle-Discovered Maps

- Admin-authored: an Admin (or permitted User) edits the Map in advance to guide Vehicle navigation and mark restricted locations.
- Vehicle-discovered: a Vehicle may create or update its own memory map based on the actions it has taken; this exploration data feeds back into the Network's single Map.

### 9.5 Restricted Locations

Users with the appropriate permission can mark areas as restricted (Restricted Area / Danger Zone categories); Vehicles must treat these as no-go zones in both Autonomous and Manual modes.

---

## 10. Vehicle Management

### 10.1 Vehicle Mode vs. Vehicle State

Mode and State are tracked independently. Mode describes the operating paradigm (Autonomous or Manual/Remote-controlled); State describes the Vehicle's real-time condition regardless of Mode — for example, a Vehicle in Autonomous Mode can simultaneously be in the Waiting State.

| Vehicle State | Description |
|---|---|
| Online | Vehicle is connected and reachable by the system. |
| Offline | Vehicle is powered off or unreachable. |
| Busy | Vehicle is currently executing a Task. |
| Idle | Vehicle is online and available for assignment. |
| Moving | Vehicle is in transit (to pickup or drop-off). |
| Waiting | Vehicle is stationary awaiting an event (e.g., loading). |
| Disconnected | Vehicle unexpectedly lost its connection mid-operation. |
| Error | Vehicle has reported a fault condition. |

### 10.2 Vehicle Command System

Manual control is never exposed as raw movement buttons; the UI issues discrete, well-defined Commands, which keeps the Vehicle-side firmware/RL contract stable regardless of UI changes.

| Command | Description |
|---|---|
| Move | Directs the Vehicle to proceed toward a destination. |
| Stop | Immediately halts current motion. |
| Pause | Temporarily suspends the current Task without cancelling it. |
| Resume | Continues a Paused Task. |
| Return Home | Sends the Vehicle to its configured Home Position. |
| Emergency Stop | Highest-priority halt, overriding all other commands. |
| Manual Override | Switches the Vehicle into Manual/Remote-controlled Mode. |
| Blink Indicator | Triggers a visual/audible identification signal. |
| Custom Command | Extension point for future vehicle-specific commands. |

### 10.3 Vehicle Positions

Every Vehicle records a Home Position, a Charging Position, and a Parking Position, enabling features such as Return Home and automated charging routines in future releases.

### 10.4 Vehicle History & Analytics

The system retains, per Vehicle: Task history, travel history, distance travelled, battery usage, manual control sessions, and errors. This history is surfaced to Admins as analytics/dashboards, including (at minimum): tasks completed today, vehicle utilization, average task duration, distance travelled, failed tasks, and vehicle availability.

### 10.5 Sensor Extensibility

The initial sensor set is IR and UV, but the data model and UI are built to be dynamic: any future sensor (Temperature, Humidity, Lidar, Ultrasonic, GPS, Encoder, Custom) can be added without hardcoding, by registering a new sensor type against the Vehicle's sensor profile.

---

## 11. Communication & Notifications

### 11.1 Communication Topology

Phone-to-backend communication runs over the internet (React Native app to the Render-hosted backend, which talks to Firebase). Backend-to-vehicle and phone-to-vehicle communication may run over Bluetooth or WiFi, depending on Vehicle capability, for both registration and low-latency manual control/telemetry. This same dual-path model applies to Vehicle registration and to User↔Vehicle command traffic.

### 11.2 Network Messaging

Network messaging is broadcast-only in V1.0: every Network automatically has one broadcast group, and any message sent by an authorized member (canBroadcastMessage) reaches all Users and Admins currently in that Network. Direct User-to-User chat is not part of V1.0.

### 11.3 Notification Categories

| Category | Purpose |
|---|---|
| System | Platform-level notices (maintenance, version updates). |
| Fleet | Cross-vehicle/fleet-level events. |
| Task | Task lifecycle transitions relevant to the recipient. |
| Vehicle | Individual Vehicle state/error events. |
| Network | Membership, role, and network-configuration changes. |
| Security | Authentication and permission-sensitive events. |

### 11.4 Offline Behavior

If internet connectivity is lost, the system stops all operation — there is no Bluetooth-only manual-control fallback in V1.0. This is a deliberate simplification to avoid divergent state between the app, backend, and Firestore while offline.

---

## 12. Firebase Data Model

### 12.1 Platform Decision

Cloud Firestore is the system of record, chosen over the Realtime Database for its richer querying, cleaner document structure, easier RBAC via Security Rules, optional offline support, and better fit for structured entities like Users, Vehicles, Networks, and Tasks. Firebase Authentication (Google Sign-In only, for V1.0) is used alongside Firestore.

### 12.2 UUID Strategy

Every major entity is assigned a globally unique identifier (UUID) at creation time, independent of the Firestore document path. Firestore document IDs may or may not equal the UUID depending on implementation convenience, but all cross-entity references in application logic use the UUID field, never the raw Firestore path. This keeps exports, integrations, and future migrations decoupled from Firestore internals.

### 12.3 Standard Entity Metadata

Every collection listed below includes the following common fields on each document, in addition to its entity-specific fields:

| Field | Purpose |
|---|---|
| createdAt / createdBy | Audit trail of record creation. |
| updatedAt / updatedBy | Audit trail of last modification. |
| isDeleted | Soft-delete flag; records are never hard-deleted. |
| status | Entity-specific status enum (e.g., active/archived for Networks). |
| version | Optimistic concurrency / schema version marker. |

### 12.4 Core Collections

| Collection | Key | Purpose |
|---|---|---|
| users | userId (UUID) | Global user profile, auth link, list of network memberships. |
| networks | networkId (UUID) | Network metadata, SuperAdmin reference, settings. |
| networkMembers | membershipId (UUID) | Join record: networkId, userId, roleId, active flag. |
| vehicles | vehicleId (UUID) | Hardware ID, current networkId (nullable = Ecosystem-only), mode, state, positions. |
| tasks | taskId (UUID) | networkId, createdBy, assignedVehicleId, priority, lifecycle state, item/location details. |
| maps | mapId (UUID) | networkId, current version pointer. |
| mapVersions | mapVersionId (UUID) | mapId, versionNumber, objects[] snapshot. |
| mapObjects | objectId (UUID) | mapVersionId, category, geometry, rotation, color, properties. |
| roles | roleId (UUID) | networkId, name, permissions[]. |
| permissions | permissionId (UUID) | Key, description (system-defined catalogue). |
| activity | activityId (UUID) | networkId, timestamp, actor, event description. |
| notifications | notificationId (UUID) | recipientId, category, payload, read flag. |
| messages | messageId (UUID) | networkId (broadcast group), senderId, body, timestamp. |
| vehicleHistory | historyId (UUID) | vehicleId, type (task/travel/error/session), payload, timestamps. |

### 12.5 Security Rules Approach

Firestore Security Rules enforce Network-scoped access (a User may only read/write documents belonging to Networks they are an active member of) and Permission-scoped writes (sensitive fields/collections check the caller's Role permissions via a server-side custom claim or a Firestore lookup). Cross-cutting checks that Security Rules cannot express cleanly (e.g., vehicle deadlock resolution, cross-network SuperAdmin operations) are performed by the Render backend using the Firebase Admin SDK.

---

## 13. Screen Specifications

The table below enumerates the Version 1.0 screen inventory for the Parcel Pilot Interface. Each screen inherits the active Network context, the current User's Role/Permissions, and the selected theme (Dark/Light). Detailed wireframes and field-level specifications are maintained as a companion design artifact and referenced here by name for traceability.

| Screen | Purpose |
|---|---|
| Auth / Sign-In | Google Sign-In entry point; routes to Network Selection or Onboarding. |
| Network Selection | Lists Networks the User belongs to; sets the active Network. |
| Dashboard / Home | Live overview: fleet status, active Tasks, recent Activity Feed. |
| Vehicle List | All Vehicles in the active Network with State/Mode badges. |
| Vehicle Detail | Live telemetry, position, sensors, command controls, history tabs. |
| Manual Control | Command-based remote control surface (Move/Stop/Pause/Resume/Return Home/E-Stop). |
| Call Vehicle | Call a specific Vehicle or request the nearest free Vehicle; shows ETA. |
| Task Creation | Item details, pickup, drop-off location picker, priority selector. |
| Task List / Queue | All Tasks in the active Network, filterable by state/priority. |
| Task Detail | Lifecycle timeline, assigned Vehicle, cancel action (permission-gated). |
| Map Viewer | Read-only live map with Vehicles, Map Objects, and restricted zones. |
| Map Editor | Admin/permitted-User tool to place/edit Map Objects; version history & rollback. |
| Activity Feed | Chronological Network events (Admin-only). |
| Broadcast Messaging | Network-wide broadcast composer and message history. |
| Notifications | Categorized notification inbox (System/Fleet/Task/Vehicle/Network/Security). |
| Roles & Permissions | Admin screen to create Roles from the Permission catalogue and assign Users. |
| User Management | Invite/remove Users, view membership, assign Roles. |
| Vehicle Registration | Admin flow: pair Bluetooth ID, confirm connection, name, assign to Network. |
| Analytics Dashboard | Fleet/task/vehicle KPIs for Admins. |
| Settings | Theme toggle (Dark/Light), profile management, account/session controls. |

### 13.1 Navigation Model

Navigation is Network-scoped: after Sign-In and Network Selection, all subsequent screens operate within the active Network until the User explicitly switches Networks. Role/Permission checks determine which tabs (e.g., Map Editor, Analytics, Activity Feed, Roles & Permissions) are visible at all, rather than showing disabled controls.

---

## 14. UI/UX Guidelines

### 14.1 Design Language

Parcel Pilot targets an industrial, modern aesthetic appropriate for warehouse/factory floor use on tablets and phones: high contrast, large touch targets for gloved operation, and clear status color-coding (State and Task lifecycle colors must be consistent system-wide).

### 14.2 Theming

Both Dark and Light themes are built from the beginning (Dark is the default), sharing a single design system so that neither theme is an afterthought. Users switch themes from Settings, which also hosts profile and account management.

### 14.3 Status Color Coding (indicative)

| Concept | Color Cue |
|---|---|
| Idle / Online | Green |
| Busy / Moving | Blue |
| Waiting | Amber |
| Error / Disconnected | Red |
| Critical Task Priority | Red badge |
| High Task Priority | Orange badge |
| Normal Task Priority | Blue badge |
| Low Task Priority | Grey badge |

### 14.4 Accessibility & Device Targets

- Android phones and tablets, portrait and landscape.
- Minimum touch target sizing suitable for industrial/warehouse use.
- Legible typography and color contrast in both themes, including outdoor/bright-light readability considerations for tablet use on a factory floor.

---

## 15. System Workflows

### 15.1 Vehicle Registration Workflow

Power On Vehicle → Bluetooth Pairing → Read Vehicle ID → Register → Assign Name → Assign to Ecosystem → (any Admin) Assign to Network → Done.

### 15.2 Task Assignment Workflow

User creates Task (items, drop-off, priority) → Task Queued → Vehicle Accepted/Assigned → Vehicle Moving to pickup → Loading → Transporting → Unloading → Completed. At any point prior to Completed, the Task may branch to Cancelled (permission-gated) or Failed (Vehicle failure).

### 15.3 Vehicle Call Workflow

User calls a specific Vehicle → if free, Vehicle proceeds directly; if busy, system returns ETA and the User may wait for acceptance. Alternatively, the User requests the nearest/most optimal free Vehicle → out-of-application logic selects a Vehicle → application resolves any deadlock between competing requests → Vehicle dispatched.

### 15.4 Map Editing & Versioning Workflow

Admin/permitted User opens Map Editor → places/edits Map Objects → Save → new immutable Map Version created → (optional) Rollback to a prior version if an error is introduced.

### 15.5 Manual Control Workflow

User with canManualControl opens Vehicle Detail → issues Manual Override command → Vehicle Mode switches to Manual → User issues Move/Stop/Pause/Resume/Blink/Emergency Stop commands → session and duration recorded in Vehicle History as a Manual Control Session → User (or timeout) ends session, Vehicle returns to prior Mode.

### 15.6 Vehicle Failure Workflow

Active Task in progress → Vehicle reports battery loss, disconnect, or physical obstruction → Task transitions to Failed → Activity Feed and Vehicle History record the event → Notification (Vehicle/Task category) sent to relevant Users/Admins.

---

## 16. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Vehicle command round-trip (app → backend/Bluetooth → vehicle) should feel real-time for manual control (target sub-second UI feedback for command acknowledgment). |
| Scalability | Firestore schema and backend must support multiple concurrent Networks, each with multiple Vehicles and Users, without cross-Network data leakage. |
| Availability | Backend (Render) and Firebase should target standard cloud availability; the system fails safe (stop-all) when internet is unavailable rather than operating in an inconsistent partial-offline mode. |
| Usability | Industrial, high-contrast UI usable one-handed or with gloves; Dark/Light themes both first-class. |
| Auditability | Every entity carries createdAt/By, updatedAt/By, isDeleted, status, and version, enabling full audit trails and safe soft-deletes. |
| Portability | Use of UUIDs independent of Firestore document IDs keeps data portable to future storage or export formats. |
| Maintainability | Command-based Vehicle control and generic Map Objects/Sensor types avoid hardcoding, easing future extension. |
| Compatibility | Android phones and tablets as the V1.0 target; React Native + TypeScript codebase. |

---

## 17. Security Requirements

### 17.1 Authentication

Authentication is provided by Firebase Authentication using Google Sign-In only for V1.0. No password-based or anonymous authentication is supported in this release.

### 17.2 Authorization

- All sensitive reads/writes are scoped to the caller's active Network membership.
- All sensitive actions (task assignment/cancellation, map editing, manual control, vehicle registration/assignment, user/role management, broadcast messaging, analytics/activity-feed viewing) are gated by the specific Permission keys defined in Section 6.3.
- The SuperAdmin bypasses per-Network permission checks entirely and has unrestricted system-wide access, including the ability to transfer Network ownership.

### 17.3 Data Protection

- Firestore Security Rules enforce Network isolation and permission checks at the data layer as a defense-in-depth measure alongside backend validation.
- Soft-delete (isDeleted) is used everywhere instead of hard deletion, preserving history for audits and analytics.

### 17.4 Vehicle Communication Security

- Vehicle pairing requires a unique hardware identifier (Bluetooth ID) and an explicit Admin-initiated registration step.
- Command issuance to a Vehicle is authenticated and permission-checked before being relayed by the backend or sent directly over Bluetooth/WiFi.

### 17.5 Notification Security

The Security notification category exists specifically to surface authentication and permission-sensitive events (e.g., a new device sign-in, a permission escalation) to affected Users and Admins.

---

## 18. Future Roadmap

The following items are intentionally deferred from V1.0 but are reserved as hidden/placeholder menu entries so the navigation structure does not need to be reworked later:

- Advanced Analytics & Reports beyond the V1.0 dashboard KPIs.
- Fleet Statistics — cross-Network benchmarking (SuperAdmin only).
- Maintenance scheduling and predictive-maintenance alerts per Vehicle.
- Diagnostics — deeper firmware/sensor-level diagnostic tooling.
- Direct User-to-User chat, in addition to the existing broadcast-only messaging.
- Bluetooth-only offline manual control fallback, if stricter shop-floor connectivity requirements emerge.
- SuperAdmin approval gating for Vehicle registration, if stricter governance is later required.
- Task lifecycle enrichment with automatic Pause/Retry/Waiting states on recoverable Vehicle failures (V1.0 always fails the Task outright).
- Deeper RL integration hooks — richer telemetry contracts to support increasingly autonomous fleet coordination.

> **Note:** These roadmap items are explicitly non-binding for V1.0 sign-off and exist to guide forward-compatible schema and navigation decisions only.

---

## 19. Appendices

### Appendix A — Glossary

See Section 2.4 (Definitions, Acronyms, and Abbreviations) for the authoritative glossary.

### Appendix B — Entity Relationship Summary

- Network (1) — (many) Vehicles [active assignment, one Network at a time]
- Network (1) — (many) NetworkMembers (many) — (1) User [User active in exactly one Network at a time]
- Network (1) — (1) Map — (many) MapVersions — (many) MapObjects
- Network (1) — (many) Tasks — (1) Vehicle [per Task assignment] — (1) User [creator]
- Network (1) — (many) Roles — (many) Permissions [many-to-many via Role.permissions[]]
- Network (1) — (many) Activity entries
- Network (1) — (1) Messaging group — (many) Messages
- Vehicle (1) — (many) VehicleHistory entries

### Appendix C — Approved Decision Log

The following decisions were explicitly confirmed by the Product Owner during requirements gathering and are binding for V1.0:

- Fleet-centric architecture with Network as the top-level entity (replacing the original vehicle-centric framing).
- Single SuperAdmin ownership per Network; multiple Admins permitted per Network.
- Vehicle registration is Admin-initiated via Bluetooth ID pairing; no SuperAdmin approval required.
- A Vehicle belongs to exactly one Network at a time, but exists in the SuperAdmin's Ecosystem prior to/between assignments.
- Vehicle-to-User call negotiation and free-vehicle selection are handled outside the application; the application only surfaces ETAs and resolves deadlocks.
- Tasks are owned by the Network, authored by a User, and assigned to a Vehicle.
- Task priorities and cancellation permissions are Admin-configurable via RBAC, with sane defaults.
- Vehicle failure during a Task always results in Failed status in V1.0 (no auto Pause/Retry).
- Exactly one Map per Network, with versioning and rollback.
- Vehicle History is retained and surfaced as Admin analytics.
- Communication is phone-to-backend over the internet, and backend/phone-to-vehicle over Bluetooth or WiFi.
- Sensor system is expandable beyond the initial IR/UV set.
- Activity Feed is Admin-only.
- No connectivity fallback: the system stops entirely when internet is unavailable.
- Dark and Light themes both ship in V1.0, managed from Settings alongside profile management.
- Permission-based RBAC (not hardcoded roles) is used for all access control.
- SuperAdmin has unrestricted, system-wide access including ownership transfer.
- Cloud Firestore (not Realtime Database) is the system of record, paired with Firebase Authentication (Google Sign-In only).
- Every major entity carries a UUID independent of its Firestore document ID, plus standardized createdAt/By, updatedAt/By, isDeleted, status, and version metadata.

### Appendix D — Sign-Off

| Role | Name | Signature | Date |
|---|---|---|---|
| Product Owner |  |  |  |
| Technical Lead |  |  |  |
| QA Lead |  |  |  |


---

*End of Document — Parcel Pilot SRS v1.0*
