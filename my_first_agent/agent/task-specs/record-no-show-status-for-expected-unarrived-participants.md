# Record no-show status for expected unarrived participants Task Specification

## Basic Information

- **Task ID:** T9
- **Task name:** Record no-show status for expected unarrived participants
- **Task type:** Act
- **Task owner:** CPVC Event Organizer

## 1. Task Description

Sweeps the registration database immediately after the event check-in window closes. It applies a fixed operational rule to bulk-update any participant whose status is still "Registered" or "Confirmed" to "No-show", finalizing the attendance records.

## 2. Inputs

### Input 1

- **Input name:** End of Check-in Trigger
- **Contents and format:** System time event passing the venue's official check-in closure time (datetime string).
- **Source:** D9: Has the check-in window closed?

- **If a required input is missing or invalid:** Record `closure_trigger_failed` and alert the CPVC Event Organizer to manually trigger the sweep.

## 3. Outputs

### Output 1

- **Output name:** No-show Status Roster Update
- **Contents and format:** Batch database confirmation detailing the number of records updated to "No-show".
- **Next task or recipient:** T11: Compare forecast with actual check-ins
- **Complete when:** The database returns a success code for the batch update.

## 4. Planned Tools

### Tool 1

- **Tool name:** `batch_update_no_shows`
- **Input:** End of Check-in Trigger
- **Output:** No-show Status Roster Update
- **Implementation Route:** database queries
- **Integration approach:** direct integration
- **Role in this task:** Executes a bulk SQL update to change remaining expected attendees to no-shows.
- **Task timeout:** 30 seconds
- **Maximum retries:** 1
- **Retry only when:** The database query times out before executing, waiting 5 seconds. Do not retry if the write status is uncertain to avoid overwriting late check-ins.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `no_show_update_failed` and hand off to the CPVC Event Organizer.
