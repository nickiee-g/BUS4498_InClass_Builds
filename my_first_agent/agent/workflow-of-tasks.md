# Workflow of Tasks

*Replace all bracketed prompts with information specific to your proposed system. Delete instructional text that does not belong in your final specification. Add or remove task sections as needed. Every task shown in the general workflow must have a corresponding task specification below.*

## 1. Workflow Overview
### 1.1 Workflow Goal
This workflow supports the system goal defined in `my_first_agent/README.md`.

### 1.2 Workflow Trigger
The workflow is triggered when a participant registers for the hackathon event

### 1.3 Completion Condition at Runtime
The condition is complete when the applicant has signed in on the day of the hackathon event
### 1.4 General Workflow

The general workflow is to collect registration data, track participant status (registered, no-show, canceled, waitlisted, or checked in, identify attendance risk (flag registrants who have not confirmed, missed deadlines, or shows patterns of not showing), send reminder notices (confirmation request, cancelation option), backfill open seats, create the forecast to estimate attendance, report event day check in (record actual arrivals, show organizers the expected vs actual attendance and finally learn after the event (compare the forecast with actual check-ins, calculate the check-in rate, and use the results to improve the next event’s reminders and predictions)
### 1.5 Workflow Diagram

```mermaid
flowchart TD
    S([Start: Registration period opens]) --> T1["T1: Collect registration data"]
    T1 --> T2["T2: Track participant status"]

    T2 --> D1{"D1: What is the participant status?"}

    D1 -->|Registered| T3["T3: Identify attendance risk"]
    D1 -->|Canceled| T6["T6: Backfill open seats"]
    D1 -->|Waitlisted| D4{"D4: Is an open seat available?"}
    D1 -->|Checked in| T8["T8: Record event-day check-in"]
    D1 -->|No-show| T9["T9: Record no-show status"]

    T3 --> D2{"D2: Is the participant at risk of not attending?"}
    D2 -->|Yes| T4["T4: Send reminder notices"]
    D2 -->|No| D3{"D3: Has the 48-hour cutoff arrived?"}

    T4 --> D5{"D5: Did the participant respond?"}
    D5 -->|Confirmed| T5["T5: Update participant status"]
    D5 -->|Canceled| T5
    D5 -->|No response| T3

    T5 --> D6{"D6: Did the participant cancel?"}
    D6 -->|Yes| T6
    D6 -->|No| D3

    D4 -->|Yes| T6
    D4 -->|No| D3

    T6 --> D7{"D7: Is an eligible waitlisted participant available?"}
    D7 -->|Yes| T7["T7: Offer open seat"]
    D7 -->|No| D3

    T7 --> D8{"D8: Did the waitlisted participant accept?"}
    D8 -->|Yes| T2
    D8 -->|No| T6

    D3 -->|No| T3
    D3 -->|Yes| T10["T10: Create attendance forecast"]

    T10 --> R1["Review point: Share expected attendance with organizers"]
    R1 --> T8

    T8 --> D9{"D9: Has the check-in window closed?"}
    D9 -->|No| T8
    D9 -->|Yes| T9

    T9 --> T11["T11: Compare forecast with actual check-ins"]
    T11 --> T12["T12: Calculate check-in rate"]
    T12 --> T13["T13: Improve reminders and predictions"]

    T13 --> D10{"D10: Is another hackathon planned?"}
    D10 -->|Yes| T1
    D10 -->|No| E([Stop: Event results finalized])
```

```mermaid
flowchart TD
    T1["T1: First task"] --> T2["T2: Second task"]
    T2 --> D1{"Decision condition?"}
    D1 -->|Yes| T3["T3: Next task"]
    D1 -->|No| H1["Human review"]
    H1 --> T3
    T3 --> C1([C1: Completion state])
```
