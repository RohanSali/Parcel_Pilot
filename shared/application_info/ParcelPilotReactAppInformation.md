# Parcel Pilot React App Information

**Last Updated:** July 16, 2026
**Purpose:** This document serves as a living, human-readable reference of the currently implemented features, architecture, and state of the Parcel Pilot React Native application. It strictly reflects what has *actually* been built so far.

---

## 1. Application Architecture

- **Framework:** React Native with TypeScript.
- **State Management:** Zustand (e.g., `authStore`, `networkStore`).
- **Database/Auth:** Firebase Authentication (Email/Password, Google Sign-In structure prepared) and Firebase Firestore for all persistent state.
- **Navigation:** React Navigation (Stack + Bottom Tabs).
- **Styling:** Custom theme colors hook (`useThemeColors`) supporting Light and Dark modes.
- **Icons:** `lucide-react-native`.

## 2. Implemented Features & Flows

### 2.1 Authentication & Onboarding
- **Login/Signup Screen:** Complete UI for user authentication.
- **Ecosystem Setup (SuperAdmin):** Upon first login, users not part of any ecosystem are prompted to create a new one (making them a SuperAdmin) or join an existing one via a 5-digit code.

### 2.2 Dashboard (Global Landing Page)
- After logging in and selecting/having an active ecosystem, users land on the global `DashboardScreen`.
- Shows high-level metric cards, Quick Actions.
- Includes a top header with the app title, a Notification Bell (with unread indicators), and a Settings icon.

### 2.3 Networks Hub & Management
- A dedicated hub allowing users to view the networks they are a part of within their active Ecosystem.
- **Ecosystem Switcher:** A dropdown/modal at the top right allows users to switch their active Ecosystem.
- **SuperAdmin/Admin Capabilities:**
  - Create new networks.
  - Edit network names and descriptions.
  - Delete networks.
  - Generate a temporary 5-digit **Join Code** (valid for 5 minutes) directly inside an "Invite Members" modal, complete with a live countdown timer.
  - Invite existing ecosystem members to a network directly.
- **User Capabilities:**
  - Join networks via the provided 5-digit join code.
  - View networks they are a member of.
- Clicking a network navigates the user into the **Bottom Tab Navigator** context for that specific network.

### 2.4 Inside a Network (Bottom Tab Navigator)
- Once inside a network, the navigation switches to a bottom tab bar containing 5 core tabs:
  1. **Network Dashboard (Network Home):** Displays network-specific stats and active tasks.
  2. **Chats:** Placeholder for network communication.
  3. **TaskList:** Placeholder for managing tasks.
  4. **MapViewer:** Placeholder for vehicle/map tracking.
  5. **VehiclesList:** Placeholder for managing vehicles inside the network.
- The header of the bottom tabs dynamically displays the current Network Name and provides navigation back to the global Dashboard, Notifications, and Settings.

### 2.5 Role-Based Access Control (RBAC) & User Management
- **Roles:** `SuperAdmin` (Ecosystem Owner), `Admin`, `User`.
- **User Management Screen:** 
  - SuperAdmins and Admins can view all users in the Ecosystem.
  - They can promote a `User` to `Admin`, which automatically adds the user to all networks in the Ecosystem.
  - They can demote an `Admin` back to `User`.
  - They can remove a user entirely from the Ecosystem, which safely syncs with the user's global profile to remove ecosystem associations.
  - Users can explicitly "Leave" an ecosystem, updating their profile globally.

### 2.6 Notifications System
- Integrated via `NotificationService.ts` and Firestore `users/{uid}/notifications` subcollection.
- **Types of notifications implemented:**
  - Ecosystem Joins (sent to SuperAdmin).
  - Network Joins via code (sent to Admins/SuperAdmins).
  - Direct Network Invitations.
  - Role Updates (Promotions/Demotions/Removals sent to the affected user).
- **Notification UI:** `NotificationsScreen` with mark-as-read functionality and a realtime `NotificationBell` indicator on the Dashboard/Header.

## 3. Known Constraints & State
- Real vehicle integration (Arduino/RL/Python Backend) is not yet wired to the frontend UI; the UI currently relies purely on Firebase for mock state and entity structures.
- Map rendering and Task execution logic are placeholders waiting for the backend Fleet Orchestrator hooks.

---
*Note: Keep this file updated as major architectural shifts, new screens, or backend integrations are finalized.*
