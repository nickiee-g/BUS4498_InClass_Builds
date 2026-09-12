# backfill-open-seats Task Specification

```yaml
# BASIC INFORMATION
task_id: "T6"
task_name: "Offer open seat"
task_owner: "Hackathon Registration and Attendance Planning Agent, Hackathon Team Manager fills open seat"
```

## 1. Task Goal

- Evaluate the waitlist, conduct outreach to the next available candidates, interpret their availability or conditional replies, and secure confirmed attendees to fill all open seats without exceeding venue capacity.

## 2. Inbound Inputs

### Input 1

**Input Name:** Updated Participant Status Data
**What it contains:** The updated roster or data feed showing which participants have canceled, revealing the exact number of open seats that need to be backfilled.
**Source:** T5: Update participant status

### Input 2
**Input Name:** Waitlist Data
**What it contains:** The contact information and queue order of participants who are currently waiting for an available seat. 
**Source:** T2: Track participant status

## 3. Tool Permissions and Boundaries

## 4. How the Agent Should Reason

*Remove this instruction before your submission.* Define the kinds of work the agent is permitted to perform. Do not prescribe a fixed sequence. The agent chooses its next subtask using intermediate findings and may skip, repeat, or combine permitted subtasks within the limits above. Individual subtasks do not all have to be Level 3. Copy the “Permitted Subtask” block for each additional kind of work the agent may perform.

### Permitted Subtask 1

- **Subtask name:** [Use a verb-object name.]
- **Substask description:** [Explain what information the subtask examines and what finding or intermediate result it produces.]
- **Subtask boundary:** [State what the subtask may and may not do, including any prerequisite or required approval.]
- **Retry limits:** [Maximum number of times this subtask may be attempted before the agent chooses another permitted subtask or hands the case to a person.]

**

- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** [What evidence shows that the required result is complete and acceptable? Confidence alone is not enough.]
- **Hand off early when:** [What missing evidence, lack of progress, failure, or out-of-scope finding requires human review?]
- **Hand off to:** [Specific person, role, or review queue]

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

*Remove this instruction before your submission.* Below are the default outbound deliverable items. Please revise as needed or leave them as they are if they fit your Level 3 task.

- **Status:** completed or escalated to human.
- **Result or recommendation:** The completed result. If the task was escalated before reaching a supported result, write undetermined.
- **Evidence summary:**  The most important evidence supporting the result or explaining why no result could be reached.
- **Subtasks performed:**  The permitted subtasks completed, including repeated attempts.
- **Unresolved issues:**  Remaining uncertainties or questions. Write none only when the task has been completed successfully.
- **Handoff note:** Reason for stopping, unresolved questions, and what the reviewer needs to decide; write “Not applicable” for a completed task.
- **Next task or recipient:** Who receives the completed output? Unresolved cases go to the handoff recipient above.
