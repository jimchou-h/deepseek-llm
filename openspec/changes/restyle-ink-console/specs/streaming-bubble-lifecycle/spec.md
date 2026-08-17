## ADDED Requirements

### Requirement: Streaming row only while loading

`buildMessageListItems` SHALL append a streaming row only when the session is loading and streaming content or reasoning is present. When the session is not loading, the list SHALL contain only persisted messages, even if leftover streaming strings remain in the streaming store.

#### Scenario: Idle list omits streaming row

- **WHEN** persisted messages include a completed assistant reply and `isLoading` is false
- **THEN** the list contains no streaming row

#### Scenario: Loading list appends one streaming row

- **WHEN** `isLoading` is true and streaming content or reasoning is non-empty
- **THEN** the list ends with exactly one streaming row after the persisted messages

### Requirement: Stream completion cancels pending frames

When a chat completion finishes or fails, the client SHALL cancel any pending `requestAnimationFrame` stream throttle for that send, clear that session's streaming content and reasoning, and set loading to false. A late animation frame SHALL NOT recreate a streaming bubble after the assistant message is persisted.

#### Scenario: Completed reply is a single bubble

- **WHEN** streaming finishes and the assistant message has been added to the session
- **THEN** the visible message list shows that assistant reply once (persisted bubble only)

#### Scenario: Error still clears streaming

- **WHEN** the completion request fails after streaming has started
- **THEN** loading is false and no streaming row remains for that session
