## MODIFIED Requirements

### Requirement: Global context message limit

The system SHALL provide a globally persisted setting `contextMessageLimit` that controls how many conversation messages are included when calling the model. The default value SHALL be 20. The setting SHALL be editable in the settings UI.

#### Scenario: Default limit

- **WHEN** a user has never configured the context limit
- **THEN** outgoing chat requests use a limit of 20 conversation messages

#### Scenario: User changes limit

- **WHEN** the user sets the context message limit to a valid positive integer N in settings
- **THEN** subsequent chat requests use N as the conversation message limit
- **AND** the value is persisted across reloads

## ADDED Requirements

### Requirement: Truncate oversized messages in API payload

When building the model request, the system SHALL truncate any single message whose content exceeds 8000 characters to its first 8000 characters plus a truncation marker. Truncation SHALL affect only the outgoing payload; persisted messages in the UI MUST remain complete.

#### Scenario: Long pasted content is trimmed

- **WHEN** a session contains a user message of 20000 characters and a request is built
- **THEN** the payload contains that message truncated to 8000 characters with a marker
- **AND** the message shown in the UI is unchanged

#### Scenario: Normal messages untouched

- **WHEN** all messages are within 8000 characters
- **THEN** payload content is byte-identical to stored content

### Requirement: Cap generated output length

Chat completion requests SHALL include `max_tokens: 8192` in the request body so a runaway generation has a hard upper bound on output tokens.

#### Scenario: Request body includes cap

- **WHEN** the client sends a chat completion request
- **THEN** the JSON body contains `max_tokens` with value 8192
