# Compare forecast with actual check-ins Task Specification

## Basic Information

- **Task ID:** T11
- **Task name:** Compare forecast with actual check-ins
- **Task type:** Reason
- **Task owner:** CPVC Event Organizer

## 1. Task Description

Compares the pre-event expected attendance forecast against the actual post-event check-in data to identify the exact variance. This calculation is required to establish the baseline error margin of the current workflow.

## 2. Inputs

### Input 1

- **Input name:** Expected Attendance Forecast
- **Contents and format:** The predicted headcount number (integer) from before the event.
- **Source:** T10: Create attendance forecast

### Input 2

- **Input name:** Final Attendance Roster
- **Contents and format:** Database summary of all participants with a "Checked in" status.
- **Source:** T9: Record no-show status

- **If a required input is missing or invalid:** Record `comparison_data_missing` and flag the CPVC Event Organizer to resolve the database gap.

## 3. Outputs

### Output 1

- **Output name:** Forecast Variance Report
- **Contents and format:** A structured record detailing the numerical gap between expected and actual attendance.
- **Next task or recipient:** T12: Calculate check-in rate
- **Complete when:** The script returns the final calculated variance integer.

## 4. Planned Tools

### Tool 1

- **Tool name:** `calculate_forecast_variance`
- **Input:** Final Attendance Roster (and Expected Attendance Forecast)
- **Output:** Forecast Variance Report
- **Implementation Route:** functions/scripts
- **Integration approach:** direct integration
- **Role in this task:** Subtracts the actual check-in count from the forecasted check-in count.
- **Task timeout:** 5 seconds
- **Maximum retries:** 1
- **Retry only when:** The calculation script times out, waiting 1 second.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `variance_calc_failed` and hand off to the CPVC Event Organizer.
