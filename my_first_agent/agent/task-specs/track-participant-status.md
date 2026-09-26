# Track participant status Task Specification

## Basic Information

- **Task ID:** T2
- **Task name:** Track participant status
- **Task type:** Remember
- **Task owner:** CPVC Event Organizer

## 1. Task Description

Maintains and retrieves the current status of each participant (e.g., Registered, Waitlisted, Canceled, Checked in, No-show). This ensures the workflow routes participants to the correct subsequent logic branches based on their most up-to-date state.

## 2. Inputs

### Input 1

- **Input name:** Standardized Registration Record / Status Update
- **Contents and format:** Structured database record containing a unique participant ID and a status string.
- **Source:** T1: Collect registration data (and subsequent update tasks like T5, T7, T8, T9)

- **If a required input is missing or invalid:** Record `status_tracking_error` and flag the participant ID for the CPVC Event Organizer.

## 3. Outputs

### Output 1

- **Output name:** Current Participant Status
- **Contents and format:** A validated string reflecting the participant's exact status category (Registered, Canceled, Waitlisted, Checked in, or No-show).
- **Next task or recipient:** D1: What is the participant status?
- **Complete when:** The database query successfully returns a recognized status string.

## 4. Planned Tools

### Tool 1

- **Tool name:** `track_participant_status`
- **Input:** Standardized Registration Record / Status Update
- **Output:** Current Participant Status
- **Implementation Route:** database queries
- **Integration approach:** direct integration
- **Role in this task:** Queries the master event database to fetch or log the current active status of a specified participant ID.
- **Task timeout:** 10 seconds
- **Maximum retries:** 2
- **Retry only when:** The database returns a concurrency lock or temporary read error, waiting 2 seconds.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `database_read_failed` and route the case to the CPVC Event Organizer.
