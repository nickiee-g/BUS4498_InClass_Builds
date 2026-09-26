# Send reminder notices Task Specification

## Basic Information

- **Task ID:** T4
- **Task name:** Send reminder notices
- **Task type:** Act
- **Task owner:** CPVC Event Organizer

## 1. Task Description

Dispatches an automated, templated email to participants flagged as at-risk, requesting them to either confirm their attendance or cancel. This task executes a fixed operational procedure without adapting the template text.

## 2. Inputs

### Input 1

- **Input name:** At-Risk Participant Contact Info
- **Contents and format:** Participant name and email address, passed as string variables.
- **Source:** D2 (Decision node routing from T3)

- **If a required input is missing or invalid:** Record `invalid_contact_info` and pass the record to the CPVC Event Organizer to resolve.

## 3. Outputs

### Output 1

- **Output name:** Reminder Delivery Confirmation
- **Contents and format:** A status receipt confirming the email was sent, along with an incremented reminder count for the participant.
- **Next task or recipient:** D5: Did the participant respond?
- **Complete when:** The email API returns a `200 OK` success status.

## 4. Planned Tools

### Tool 1

- **Tool name:** `send_reminder_notices`
- **Input:** At-Risk Participant Contact Info
- **Output:** Reminder Delivery Confirmation
- **Implementation Route:** web API calls
- **Integration approach:** direct integration
- **Role in this task:** Connects to the email service provider API to push the templated reminder message to the participant's address.
- **Task timeout:** 15 seconds
- **Maximum retries:** 1
- **Retry only when:** A network timeout occurs before the email provider acknowledges receipt, waiting 5 seconds. To avoid spamming the participant, do not retry if delivery status is uncertain or if a success code was potentially dropped.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `reminder_dispatch_failed` and hand off to the CPVC Event Organizer.
