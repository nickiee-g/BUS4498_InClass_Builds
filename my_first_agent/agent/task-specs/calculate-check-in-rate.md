# Calculate check-in rate Task Specification

## Basic Information

- **Task ID:** T12
- **Task name:** Calculate check-in rate
- **Task type:** Reason
- **Task owner:** CPVC Event Organizer

## 1. Task Description

Computes the final check-in conversion rate by dividing the total number of actual attendees by the total number of initial registrants. This serves as the primary system goal metric required for reporting.

## 2. Inputs

### Input 1

- **Input name:** Final Attendance Roster
- **Contents and format:** Database summary including total original registrants and total "Checked in" participants.
- **Source:** T11: Compare forecast with actual check-ins (passes the state forward)

- **If a required input is missing or invalid:** Record `rate_data_missing` and flag the CPVC Event Organizer.

## 3. Outputs

### Output 1

- **Output name:** Final Check-in Rate Metric
- **Contents and format:** A percentage value representing the conversion rate of registrants to attendees.
- **Next task or recipient:** T13: Improve reminders and predictions
- **Complete when:** The script outputs the final percentage.

## 4. Planned Tools

### Tool 1

- **Tool name:** `compute_check_in_rate`
- **Input:** Final Attendance Roster
- **Output:** Final Check-in Rate Metric
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Divides actual check-ins by total registrants to yield the conversion percentage.
- **Task timeout:** 5 seconds
- **Maximum retries:** 1
- **Retry only when:** The script times out, waiting 1 second.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `rate_calc_failed` and hand off to the CPVC Event Organizer.
