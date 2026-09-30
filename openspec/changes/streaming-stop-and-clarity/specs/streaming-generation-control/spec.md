## ADDED Requirements

### Requirement: User can stop an in-flight generation

The system SHALL allow the user to stop receiving an in-progress assistant stream for the active session. Stopping SHALL abort the in-flight fetch via AbortController and SHALL invalidate that generation's run id so subsequent chunks from that run are ignored.

#### Scenario: Stop discards late chunks

- **WHEN** a generation with run id R is streaming and the user stops
- **THEN** the client aborts the associated AbortController
- **AND** any later chunks attributed to R MUST NOT update streaming UI or persisted messages for a newer run

#### Scenario: Stop then send again

- **WHEN** the user stops run R and immediately sends a new message starting run S
- **THEN** run S uses a new AbortController and run id
- **AND** R's cleanup MUST NOT clear S's loading or streaming state

#### Scenario: Partial text on stop

- **WHEN** the user stops after some assistant text has already been streamed
- **THEN** the system SHALL persist that partial text as an assistant message for the session (unless empty)
- **AND** the streaming bubble for that run SHALL be cleared

### Requirement: Generation completion states

The system SHALL distinguish normal completion, user abort, and incomplete disconnect where feasible.

#### Scenario: Normal completion via stream end marker

- **WHEN** the SSE stream signals completion with `[DONE]` (or equivalent done) and the reader finishes without abort
- **THEN** the assistant reply is treated as completed and persisted

#### Scenario: User abort is not success-without-note

- **WHEN** the fetch is aborted by user stop
- **THEN** the client MUST NOT treat the outcome as an unmarked successful full completion of a still-running upstream blindly
- **AND** partial persistence rules from "Partial text on stop" apply

#### Scenario: Incomplete disconnect

- **WHEN** the body stream ends without a completion marker and without user abort
- **THEN** the client SHALL surface an incomplete/error condition (message or equivalent) rather than silently pretending a guaranteed full answer
