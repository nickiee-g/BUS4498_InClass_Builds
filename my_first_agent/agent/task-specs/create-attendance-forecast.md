# Create attendance forecast Task Specification

## Basic Information

- **Task ID:** T10
- **Task name:** Create attendance forecast
- **Task type:** Reason
- **Task owner:** CPVC Event Organizer

## 1. Task Description

Calculates the estimated number of actual attendees based on the current confirmed participant count. Applies historical drop-off rates to the roster at the 48-hour cutoff to generate a final headcount forecast for event logistics.

## 2. Inputs

### Input 1

- **Input name:** Current Confirmed Roster
- **Contents and format:** Database summary containing the total count of participants with a "Confirmed" or "Registered" status.
- **Source:** D3: Has the 48-hour cutoff arrived?

- **If a required input is missing or invalid:** Record `forecast_data_error` and hand off to the CPVC Event Organizer to run a manual query.

## 3. Outputs

### Output 1

- **Output name:** Expected Attendance Forecast
- **Contents and format:** Structured report detailing the expected final headcount number and confidence interval.
- **Next task or recipient:** R1: Share expected attendance with organizers
- **Complete when:** The forecast report is successfully generated and saved to the system.

## 4. Planned Tools

### Tool 1

- **Tool name:** `calculate_attendance_forecast`
- **Input:** Current Confirmed Roster
- **Output:** Expected Attendance Forecast
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Runs a fixed mathematical script applying historical attendance conversion weights to the current confirmed headcount.
- **Task timeout:** 10 seconds
- **Maximum retries:** 1
- **Retry only when:** The script execution times out due to server load, waiting 2 seconds. 
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `forecast_failed` and hand off to the CPVC Event Organizer.
