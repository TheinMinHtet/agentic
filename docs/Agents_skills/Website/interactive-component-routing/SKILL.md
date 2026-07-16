---
name: interactive-component-routing
description: Defines the navigation logic, state management, and interaction routing for dynamic web/app interfaces.
---

## Overview
This skill defines how a user moves through a product. It maps interactive components (buttons, links, dynamic states) to specific views or data changes, ensuring a seamless journey from start to finish.

## Usage
Use this once wireframes are set to establish the "glue" that makes the UI interactive.

## Steps
1.  **State Mapping**: Define the base state and interactive states (loading, error, success, hover, active).
2.  **Define Trigger Points**: Identify which interactions initiate navigation or state changes.
3.  **Route Logic**: Map triggers to destination components or URL paths.
4.  **Transition Handling**: Define what happens *between* states (e.g., animations, data fetching).
5.  **Documentation**: Create a flow chart or route table.

## Pitfalls
*   **Broken Flows**: Dead-end paths where users get stuck.
*   **State Conflicts**: Improper handling of "back" buttons or browser history.
*   **Excessive Complexity**: Too many nested routes that confuse the user.
