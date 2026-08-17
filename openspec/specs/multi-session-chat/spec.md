# multi-session-chat Specification

## Purpose
TBD - created by archiving change multi-session-chat. Update Purpose after archive.
## Requirements
### Requirement: Multiple chat sessions

The system SHALL allow the user to create, switch between, and delete multiple locally persisted chat sessions. Exactly one session SHALL be the active session whose messages are shown in the message pane.

#### Scenario: Create a new session

- **WHEN** the user chooses to create a new conversation
- **THEN** the system creates a session with an empty message list, makes it active, and shows an empty message pane

#### Scenario: Switch sessions

- **WHEN** the user selects another session in the session list
- **THEN** the message pane SHALL display that session's messages and subsequent sends SHALL target that session

#### Scenario: Delete a session

- **WHEN** the user deletes a session
- **THEN** that session and its messages are removed from persistence
- **AND** if it was active, another session becomes active (or a new empty session is created if none remain)

### Requirement: Session title from first user message

The system SHALL set a session title from the first user message content, truncated for display in the session list. Until the first user message exists, the title SHALL be a default such as "新对话".

#### Scenario: Auto title after first user message

- **WHEN** the first user message is added to a session
- **THEN** the session title updates to a truncated form of that message's content

### Requirement: Stream continues after session switch

The system SHALL allow switching the active session while a streaming response is in progress for another session. Tokens and the final assistant message SHALL continue to be applied to the session that initiated the request, not the newly active session.

#### Scenario: Switch away during stream

- **WHEN** session A is streaming and the user switches to session B
- **THEN** session B is shown immediately
- **AND** session A's stream continues writing to session A without interruption

#### Scenario: Loading state is per session

- **WHEN** session A is streaming and session B is active
- **THEN** the input for session B SHALL NOT be blocked solely because A is streaming
- **AND** returning to A SHALL show A's in-progress or completed stream state

### Requirement: Migrate legacy single-thread store

On load, if persisted chat data uses the legacy single `messages` array without sessions, the system SHALL wrap those messages into one default session and preserve content.

#### Scenario: Legacy messages preserved

- **WHEN** the store loads legacy `{ messages: [...] }` data
- **THEN** those messages appear in a single migrated session that becomes active

