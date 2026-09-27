# Improve reminders and predictions Task Specification

## Basic Information

- **Task ID:** T13
- **Task name:** Improve reminders and predictions
- **Task type:** Learn
- **Task owner:** CPVC Event Organizer

## 1. Task Description

Updates the system's baseline attendance metrics and historical drop-off weights using the new final check-in rate and variance report. This feedback loop ensures future hackathon forecasts are incrementally more accurate.

## 2. Inputs

### Input 1

- **Input name:** Final System Analytics
- **Contents and format:** A data bundle containing the Final Check-in Rate Metric and the Forecast Variance Report.
- **Source:** T12: Calculate check-in rate

- **If a required input is missing or invalid:** Record `analytics_bundle_error` and flag the CPVC Event Organizer.

## 3. Outputs

### Output 1

- **Output name:** Updated Historical Weights
- **Contents and format:** Database update to the system's forecasting algorithm multipliers.
- **Next task or recipient:** E: Stop (Event results finalized)
- **Complete when:** The database confirms the new forecasting weights are saved.

## 4. Planned Tools

### Tool 1

- **Tool name:** `update_predictive_weights`
- **Input:** Final System Analytics
- **Output:** Updated Historical Weights
- **Implementation Route:** database queries
- **Integration approach:** direct integration
- **Role in this task:** Adjusts the baseline parameters in the master knowledge base used by future T10 tasks.
- **Task timeout:** 15 seconds
- **Maximum retries:** 1
- **Retry only when:** The database returns a concurrency lock, waiting 3 seconds. Do not retry if the write status is uncertain to avoid corrupting the system weights.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `weight_update_failed` and hand off to the CPVC Event Organizer.
