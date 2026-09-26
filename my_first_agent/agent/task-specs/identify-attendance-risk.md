# Identify attendance risk Task Specification

## Basic Information

- **Task ID:** T3
- **Task name:** Identify attendance risk
- **Task type:** Reason
- **Task owner:** CPVC Event Organizer

## 1. Task Description

Evaluates registered participants against fixed time deadlines and behavioral rules to determine if they are at risk of not attending. It calculates the time elapsed since registration or previous outreach to flag non-responders before the 48-hour cutoff.

## 2. Inputs

### Input 1

- **Input name:** Current Participant Status
- **Contents and format:** Database record including the participant's last contact timestamp and current status ("Registered").
- **Source:** D1 (Decision node routing from T2) or W1 (Wait: Scheduled checkpoint)

- **If a required input is missing or invalid:** Record `risk_eval_error` and hand the profile to the CPVC Event Organizer.

## 3. Outputs

### Output 1

- **Output name:** Risk Assessment Flag
- **Contents and format:** A boolean or categorical flag (At Risk: Yes/No) attached to the participant profile.
- **Next task or recipient:** D2: Is the participant at risk of not attending?
- **Complete when:** The risk evaluation logic completes and a Yes/No flag is generated.

## 4. Planned Tools

### Tool 1

- **Tool name:** `identify_attendance_risk`
- **Input:** Current Participant Status
- **Output:** Risk Assessment Flag
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Applies a fixed mathematical script to compare current system time against the participant's last response timestamp to trigger an "At Risk" flag if the threshold is exceeded.
- **Task timeout:** 5 seconds
- **Maximum retries:** 1
- **Retry only when:** The script fails to execute due to a local memory or processing timeout, waiting 1 second.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `script_execution_failed` and hand off to the CPVC Event Organizer.
