# Update participant status Task Specification

## Basic Information

- **Task ID:** T5
- **Task name:** Update participant status
- **Task type:** Act
- **Task owner:** CPVC Event Organizer

## 1. Task Description

Updates the master database record to reflect a participant's confirmed or canceled status based on their email response to a reminder notice. This ensures the system acts on accurate participant intent.

## 2. Inputs

### Input 1

- **Input name:** Participant Email Response
- **Contents and format:** Parsed string variable indicating a binary choice (Confirmed or Canceled).
- **Source:** D5: Did the participant respond?

- **If a required input is missing or invalid:** Record `response_parse_error` and route to the CPVC Event Organizer for manual review.

## 3. Outputs

### Output 1

- **Output name:** Confirmed/Canceled Status Update
- **Contents and format:** Structured database update logging the participant's new status.
- **Next task or recipient:** D6: Did the participant cancel?
- **Complete when:** The database returns a confirmation that the record was successfully updated.

## 4. Planned Tools

### Tool 1

- **Tool name:** `update_status_record`
- **Input:** Participant Email Response
- **Output:** Confirmed/Canceled Status Update
- **Implementation Route:** database queries
- **Integration approach:** direct integration
- **Role in this task:** Connects to the event database to change the participant's status flag to Confirmed or Canceled.
- **Task timeout:** 10 seconds
- **Maximum retries:** 1
- **Retry only when:** The database returns a concurrency lock error, waiting 2 seconds before retrying. To avoid duplicate or conflicting updates, do not retry if the write status is uncertain.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `update_failed` and hand off to the CPVC Event Organizer.
