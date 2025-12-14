# Habit Tracker — Project Flow & Architecture

A habit tracking web application focused on **consistency, streaks, and visual feedback**, designed to scale from daily tracking to yearly insights.

This document describes:

* Product goals
* User flow
* Data model
* Feature roadmap
* Architectural decisions

---

## Core Vision

The Habit Tracker helps users:

* Define daily habits
* Track completion per day
* Build streaks through consistency
* Visualize progress weekly, monthly, and yearly
* Stay motivated via milestones and feedback

The system is designed so that **data integrity comes first**, and all derived metrics (streaks, reports) are computed from logs, not stored prematurely.

---

## High-Level User Flow

### 1. Authentication

* Users sign up / log in via Supabase Auth
* Each user has isolated data
* Session persists across refresh and navigation

---

### 2. Dashboard (`/dashboard`)

This is the **daily execution view**.

**What the user sees:**

* Today’s active habits
* Checkbox for each habit
* Progress donut (completion %)
* Link to manage habits

**What happens under the hood:**

* Habits are fetched from `habits`
* Today’s completion state is fetched from `habit_logs`
* Checkbox interactions update `habit_logs`
* UI hydrates from DB on refresh

**Key rule:**

> A habit is considered “done” for the day only if there is a `habit_logs` entry for today.

---

### 3. Manage Habits (`/dashboard/habits`)

This is the **configuration view**.

**Capabilities:**

* Add new habits
* Edit habit titles
* Soft delete habits

**Design decisions:**

* Habits are never hard-deleted
* `is_active = false` hides habits from the dashboard
* Historical logs remain intact for analytics

---

## Data Model

### `habits`

Defines what the user *can* do.

| Column     | Purpose      |
| ---------- | ------------ |
| id         | Unique habit |
| user_id    | Owner        |
| title      | Habit name   |
| is_active  | Soft delete  |
| created_at | Ordering     |

---

### `habit_logs`

Defines what the user *did* on a specific day.

| Column     | Purpose          |
| ---------- | ---------------- |
| id         | Unique log       |
| user_id    | Owner            |
| habit_id   | Related habit    |
| log_date   | Day (YYYY-MM-DD) |
| completed  | true / false     |
| created_at | Timestamp        |

**Constraint:**

```sql
unique (habit_id, log_date)
```

This guarantees:

* One log per habit per day
* Clean streak calculations
* No duplicates

---

## Derived Logic (Not Stored)

The following are **computed**, never stored directly:

* Daily completion %
* Streak count
* Weekly score
* Monthly score
* Yearly rewind

This avoids:

* Sync bugs
* Manual resets
* Corrupted analytics

---

## Streak Logic (Planned)

### Definition

A streak increases by 1 **only if all active habits are completed for that day**.

### Rules

* Missing any habit breaks the streak
* Inactive habits do not count
* Streak is derived from consecutive days in `habit_logs`

### Milestones

* 7 days
* 14 days
* 21 days
* 30 days
* 50 days
* 90 days
* 100 days

Each milestone triggers:

* Encouragement message
* Visual highlight
* (Future) shareable badge

---

## Reports & Visualization (Planned)

### Weekly Report

* Completion score per day
* Average completion %
* Trend vs previous week

### Monthly Report

* Total days completed
* Best streak in the month
* Missed days

### Yearly Rewind

* Heatmap calendar (LeetCode-style)
* Total habits completed
* Longest streak
* Most consistent month

---

## Heatmap Calendar (Planned)

* One square per day
* Color intensity based on completion %
* Monthly and yearly views
* Derived from `habit_logs`

This becomes the **primary long-term motivation feature**.

---

## Architecture Decisions

### Why Server Components?

* Secure auth checks
* Cleaner data fetching
* No leaking secrets

### Why Client Components?

* Checkboxes
* Live updates
* Charts

### Why Supabase?

* Auth + DB in one platform
* RLS ready for later
* Scales well for analytics

---

## Future Enhancements (Optional)

* Drag to reorder habits
* Habit categories
* Reminders / notifications
* Public shareable progress pages
* Export reports
* Mobile-first UI polish

---

## Guiding Principle

> Store events, not conclusions.

Everything meaningful is computed from history, not saved prematurely.
