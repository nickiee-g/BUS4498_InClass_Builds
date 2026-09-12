# offer-open-seats Task Specification

```yaml
# BASIC INFORMATION
task_id: "T7"
task_name: "Offer open seat"
task_owner: "Hackathon Registration and Attendance Planning Agent, Hackathon Team Manager fills open seat"
```

## 1. Task Goal

- Autonomously manage two-way communication with a selected waitlist candidate, interpret and resolve unstructured event questions or conditional scheduling requests. Then secure a firm attendance confirmation to ensure accurate event headcount and resource management.

## 2. Inbound Inputs

### Input 1
**Input Name:** Selected Candidate Contact Information
**Contents:** The name and contact info of the eligible waitlisted individual pulled from the roster.
**Source:** T6: Backfill open seats (D7)

### Input 2
**Input Name:** Hackathon Event Details and Policies
**Contents:** The schedule, location, and catering details of the hackathon, used by the agent to answer participant questions during the offer negotiation.
**Source:** CPVC event organizers (System knowledge base)

## 3. Tool Permissions and Boundaries

## 4. How the Agent Should Reason

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
