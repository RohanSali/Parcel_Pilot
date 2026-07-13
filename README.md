# Parcel_Pilot: Autonomous Vehicle Management System

## Project Overview

This project is a React Native mobile application that serves as the primary interface for users to interact with autonomous transportation vehicles operating either in a simulation environment or in the real world.

The application is intended as an educational and research project focused on Reinforcement Learning (RL), autonomous navigation, robotics, and industrial automation.

The application itself is responsible only for the user interface and user interactions. The autonomous intelligence, path planning, Reinforcement Learning, and hardware communication are handled by external services that will be integrated in later development phases.

---

# Objectives

The application should allow authenticated users to:

* View available autonomous vehicles.
* Monitor vehicle status.
* Assign transportation tasks.
* Track vehicle movement.
* View live task execution.
* Control vehicles manually (if authorized).
* Edit navigation maps (authorized users only).
* Restrict areas within maps.
* Receive notifications.
* Manage user profiles.

---

# Vehicle Concept

Vehicles are autonomous transportation robots responsible for moving items between locations.

Vehicles may operate in:

* Simulation
* Real Hardware

The application should never assume which mode is being used. Both should appear identical from the UI perspective.

---

# User Roles

The system uses Role-Based Access Control (RBAC).

Example roles include:

* Administrator
* Supervisor
* Operator
* Viewer

Each role receives different permissions.

Examples:

Administrator:

* Full access

Supervisor:

* Assign tasks
* Monitor vehicles
* Edit maps

Operator:

* Assign tasks
* Call vehicle
* Manual control (if permitted)

Viewer:

* View only

---

# Core Features

## Authentication

Firebase Authentication will be used.

Users must log in before accessing the system.

---

## Dashboard

The dashboard provides an overview of:

* Vehicles
* Active Tasks
* Completed Tasks
* Notifications
* Quick Actions

---

## Vehicle Management

Each vehicle has:

* Vehicle ID
* Name
* Status
* Battery Level
* Current Position
* Current Task
* Mode
* Connectivity

---

## Task Assignment

Users can:

* Call vehicle
* Select destination
* Assign delivery task
* View task progress

---

## Manual Control

Authorized users can remotely control vehicles using:

* Forward
* Backward
* Left
* Right
* Stop

The interface should be designed for future backend integration.

---

## Map Management

The application includes map management features:

* View map
* Edit map
* Add restricted zones
* Add checkpoints
* Add pickup locations
* Add drop locations

---

## Notifications

Notification examples:

* Vehicle Assigned
* Task Completed
* Battery Low
* Connection Lost
* Emergency Stop
* New Vehicle Available

---

## User Profile

Contains:

* User Information
* Role
* Preferences
* Logout

---

## Settings

Contains:

* Theme
* Notifications
* About
* App Version

---

# Design Principles

The UI should be:

* Modern
* Professional
* Minimal
* Industrial
* Clean
* Responsive

Avoid excessive visual clutter.

Primary emphasis should be on clarity and operational efficiency.

---

# Development Guidelines

The codebase should be:

* Modular
* Scalable
* Component-based
* TypeScript-first
* Reusable

Business logic should remain separate from UI components.

State management should be centralized.

Networking and Firebase logic should remain inside dedicated service layers.

---

# Current Development Scope

At this stage, the application should focus only on UI structure and navigation.

Backend integration, RL integration, Arduino communication, simulations, and live vehicle communication will be implemented in later phases.

The generated project should therefore contain placeholders and mock data wherever required while maintaining a production-quality architecture.
