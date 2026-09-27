# Share expected attendance with organizers Task Specification

## Basic Information

- **Task ID:** Review Point R1
- **Task name:** Share expected attendance with organizers
- **Task type:** Decide
- **Task owner:** CPVC Event Organizer

## 1. Task Description

A human review step where the Lead Organizer evaluates the system-generated attendance forecast to make final physical logistics decisions (such as catering orders, seating, and material printing) before the event begins. 

## 2. Inputs

### Input 1

- **Input name:** Expected Attendance Forecast
- **Contents and format:** Structured report detailing the expected final headcount number.
- **Source:** T10: Create attendance forecast

- **If a required input is missing or invalid:** The workflow stalls; the human organizer manually triggers T10 to regenerate the report.

## 3. Outputs

### Output 1

- **Output name:** Acknowledged Forecast
- **Contents and format:** A digital sign-off or confirmation status indicating the forecast has been reviewed.
- **Next task or recipient:** W2: Wait until event day
- **Complete when:** The organizer explicitly clicks to approve or sign off on the forecast document in the dashboard.

## 4. Planned Tools

### Tool 1

- **Tool name:** Not applicable — manual task
- **Input:** Expected Attendance Forecast
- **Output:** Acknowledged Forecast
- **Implementation Route:** Not applicable — manual task
- **Integration approach:** Not applicable — manual task
- **Role in this task:** The human organizer reads the report and commits resources based on their judgment.
- **Task timeout:** 1 business day
- **Maximum retries:** Not applicable — manual task
- **Retry only when:** Not applicable
- **On timeout, exhausted retries, or an error that cannot be retried:** Escalate to the CPVC Organizer to manually check the dashboard.
