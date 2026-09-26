# Collect registration data

## Basic Information

- **Task ID:** T1
- **Task name:** Collect registration data
- **Task type:** Act
- **Task owner:** CPVC Event Organizer

## 1. Task Description

Collects inbound event registration data submitted by participants to initiate the workflow. Uses fixed data mapping rules to translate the raw application form submissions into standardized database records for the event roster.

## 2. Inputs

### Input 1

- **Input name:** Raw Registration Form
- **Contents and format:** JSON payload containing participant name, email, major/role, and timestamp.
- **Source:** Registration web portal

- **If a required input is missing or invalid:** Record `registration_error` and route to the CPVC Event Organizer for manual review.

## 3. Outputs

### Output 1

- **Output name:** Standardized Registration Record
- **Contents and format:** Structured database record containing participant details with an initial status set to "Registered".
- **Next task or recipient:** T2: Track participant status
- **Complete when:** The database returns a confirmation that the new record is successfully saved.

## 4. Planned Tools

### Tool 1

- **Tool name:** `collect_registration_data`
- **Input:** Raw Registration Form
- **Output:** Standardized Registration Record
- **Implementation Route:** web API calls
- **Integration approach:** direct integration
- **Role in this task:** Receives the web portal payload, validates required fields, and maps them to the standard database schema.
- **Task timeout:** 15 seconds
- **Maximum retries:** 1
- **Retry only when:** A network timeout occurs before the payload is fully received, waiting 2 seconds. To avoid duplicate entries, do not retry if the form was already acknowledged.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record `collection_failed` and hand off to the CPVC Event Organizer.
