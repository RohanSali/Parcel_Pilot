# Parcel Pilot Data Schemas

**Last Updated:** July 16, 2026

This document contains the core data structures and schemas used across the Parcel Pilot ecosystem, primarily reflecting the Firestore data structures currently implemented in the frontend.

## 1. User Schema

The global user profile, stored in the top-level `users/{uid}` collection in Firestore.

```typescript
export interface UserNotification {
  id: string;
  type: 'NETWORK_INVITE' | 'GENERAL' | 'SYSTEM' | 'ROLE_UPDATE';
  title: string;
  message: string;
  ecosystemId?: string;
  networkId?: string;
  createdAt: number;
  read: boolean;
}

export interface User {
  firebaseUid: string;           // Primary Firebase Auth ID
  userId: string;                // Secondary UUID
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isSuperAdmin: boolean;         // Indicates if they own an ecosystem (Globally)
  ecosystems: string[];          // Array of ecosystem IDs they are part of
  ecosystemCode?: string | null; // Currently active ecosystem ID
  active_econet?: {              // Currently active network within the active ecosystem
    ecosystemId: string; 
    networkId: string | null;
  };
  
  // Auditing fields
  createdAt?: number;
  updatedAt?: number;
}
```

## 2. Ecosystem Schema

The top-level operational unit, stored in the `ecosystems/{ecoCode}` collection. For small fleets (the current target), Networks and Users are embedded directly as maps within this document to optimize read speed and reduce Firestore reads.

```typescript
export interface EcosystemNetwork {
  name: string;
  description?: string;
  createdAt: number;
  joinCode?: string;             // Ephemeral 5-digit join code
  joinCodeExpiresAt?: number;    // Epoch timestamp for code expiry
}

export interface EcosystemUser {
  firebaseUid: string;
  role: 'SuperAdmin' | 'Admin' | 'User'; // Role explicitly inside this ecosystem
  networks?: string[];                   // Network IDs the user is a member of
}

export interface Ecosystem {
  ecosystemCode: string;         // Unique 6-character alphanumeric code & Document ID
  ownerFirebaseUid: string;      // The SuperAdmin creator
  
  // Embedded maps of Networks and Users to avoid heavy subcollections for small fleets
  networks: Record<string, EcosystemNetwork>; 
  users: Record<string, EcosystemUser>;
  
  createdAt: number;
}
```

## 3. Network Schema (Standalone Reference)

*Note: In the current architecture (v1.1), Networks are typically stored natively inside the Ecosystem document (see Ecosystem Schema). However, this standalone model is preserved for reference if the system transitions to a Subcollection-based approach for highly scaled networks.*

```typescript
export interface Network {
  networkId: string;
  name: string;
  superAdminId: string;
  admins: string[];              // Firebase UIDs of admins
  joinCode?: string;             // Ephemeral 5-digit code
  joinCodeExpiresAt?: number;
  
  // Base model attributes
  createdAt?: number;
  createdBy?: string;
  updatedAt?: number;
  updatedBy?: string;
  isDeleted?: boolean;
  status?: string;
  version?: number;
}
```
