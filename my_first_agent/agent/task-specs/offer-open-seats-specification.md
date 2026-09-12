# offer-open-seats Task Specification

```yaml
# BASIC INFORMATION
task_id: "T7"
task_name: "Offer open seat"
task_owner: "CPVC Event Organizer"
```

## 1. Task Goal
- Agent manages two-way communication with a selected waitlist candidate, interpret and resolve unstructured event questions or conditional scheduling requests. Then secure a firm attendance confirmation to ensure accurate event headcount and resource management.

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
- **Subtask name:** Send seat offer
- **Substask description:** Drafts and sends the initial notification to the waitlisted candidate offering the open seat.
- **Subtask boundary:** Must use standard CPVC professional tone. May only contact the single individual provided in the Selected Candidate Contact Information input. Must not offer more than one seat.
- **Retry limits:** 1 attempt

### Permitted Subtask 2
- **Subtask name:** Negotiate conditional acceptance
- **Subtask description:** Evaluates unstructured candidate requests (e.g., "I can come, but I have to leave early") against CPVC policies to determine if the condition can be accommodated.
- **Subtask boundary:** Must strictly enforce any cutoff times or venue capacity rules. May approve standard accommodations explicitly listed in the policy document. Must reject conditions that violate event rules.
- **Retry limits:** 2 attempts per conversation.

### Permitted Subtask 3
- **Subtask name:** Answer event questions
- **Subtask description:** Interprets candidate replies asking for event details (e.g., schedule, food, materials) and provides accurate answers to help them decide whether to attend.
- **Subtask boundary:** May only use the provided Hackathon Event Details and Policies input as its source of truth. Must not invent event details, make scheduling promises, or assume facts outside the approved policies.
- **Retry limits:** 3 attempts per conversation.

### Permitted Subtask 4
- **Subtask name:** Request final confirmation
- **Subtask description:** Prompts the candidate for a definitive Yes or No response when their intent remains ambiguous after answering their questions or negotiating a condition.
- **Subtask boundary:** May not interpret silence, "maybe", or "I think so" as a confirmed Yes. Must explicitly require a definitive answer.
- **Retry limits:** 2 attempts.
**

- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human
- **Stop successfully when:** The agent secures a definitive "Yes" (Confirmed) or "No" (Declined) from the candidate.
- **Hand off early when:** The candidate asks a question not covered by the Event Details input, if they demand an accommodation the agent cannot verify, or if any permitted subtask reaches its retry limit.
- **Hand off to:** Unresolved issues are routed to the CPVC Event Organizer for manual review.

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable
- **Status:** completed or escalated to human.
- **Result or recommendation:** A binary Yes (Accepted) or No (Declined/Unresolved).
- **Evidence summary:**  A brief transcript or bulleted summary of the interaction, noting any approved conditions (e.g., "Accepted: Approved for late arrival at 10 AM").
- **Subtasks performed:**  The permitted subtasks completed, including repeated attempts.
- **Unresolved issues:**  Remaining uncertainties or questions. Write none only when the task has been completed successfully.
- **Handoff note:** Reason for stopping, unresolved questions, and what the reviewer needs to decide; write “Not applicable” for a completed task.
- **Next task or recipient:** The automated routing system (Decision node D8).
