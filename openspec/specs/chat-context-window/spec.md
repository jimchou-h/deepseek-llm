# chat-context-window Specification

## Purpose
TBD - created by archiving change multi-session-chat. Update Purpose after archive.
## Requirements
### Requirement: Global context message limit

The system SHALL provide a globally persisted setting `contextMessageLimit` that controls how many conversation messages are included when calling the model. The default value SHALL be 50. The setting SHALL be editable in the settings UI.

#### Scenario: Default limit

- **WHEN** a user has never configured the context limit
- **THEN** outgoing chat requests use a limit of 50 conversation messages

#### Scenario: User changes limit

- **WHEN** the user sets the context message limit to a valid positive integer N in settings
- **THEN** subsequent chat requests use N as the conversation message limit
- **AND** the value is persisted across reloads

### Requirement: Slice recent messages for API

When building the model request for the active session, the system SHALL include the optional system prompt (if configured) plus at most the most recent `contextMessageLimit` messages from that session's message list (the same list shown in the UI). The system prompt SHALL NOT count toward the N limit.

#### Scenario: History longer than limit

- **WHEN** the active session has more than N messages and the user sends a new message
- **THEN** the API payload includes the system prompt if any
- **AND** only the newest N conversation messages from the session list (including the new user message as applicable)
- **AND** older messages remain visible in the UI but are omitted from that request

#### Scenario: History shorter than limit

- **WHEN** the active session has fewer than N messages
- **THEN** the API payload includes all conversation messages in the session (plus system prompt if any)

