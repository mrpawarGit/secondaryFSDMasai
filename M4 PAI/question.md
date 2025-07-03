# TaskTrack – Personal Task Management App

## Objective
Create a React app that allows users to add, view, update, and filter personal tasks, with shared state management, navigation, and focused input handling.

## Tech Focus

useState, useEffect for state and lifecycle
Context API for global task management
React Router for multi-page navigation
useRef for input focus management
Conditional rendering for UI states

Functional Requirements

1. Pages (Routing)
/ — Welcome page with a button linking to /tasks
/tasks — Main task manager page
/about — Static about page describing the app

2. Global State with Context API
Create a TaskContext providing:
Task list state
Functions to add tasks, toggle completion

3. Tasks Page (/tasks)
Display a list of tasks with:
Title
Description
Checkbox to toggle completion
Add Task form with:
Title input (required) — autofocus on load via useRef
Description input (optional)
Submit button disabled if title is empty
Conditional Rendering:
If no tasks, show ""No tasks yet! Add one to get started.""
Completed tasks show with strikethrough styling
Show task summary:
""3 of 5 tasks completed"" updated live

4. Data Initialization & Side Effects
Simulate fetching initial tasks inside TaskContext using useEffect and setTimeout with 1.5s delay

---