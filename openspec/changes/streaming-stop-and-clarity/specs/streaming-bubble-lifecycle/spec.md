## MODIFIED Requirements

### Requirement: Stream completion cancels pending frames

When a chat completion finishes, fails, or is **stopped by the user**, the client SHALL cancel any pending `requestAnimationFrame` stream throttle for **that run**, and SHALL clear that session's streaming content and reasoning **only if the finishing run is still the session's current run**. A late animation frame or a superseded run's `finally` SHALL NOT recreate a streaming bubble or clear a newer run's loading state after a newer assistant message flow has started.

#### Scenario: Completed reply is a single bubble

- **WHEN** streaming finishes and the assistant message has been added to the session
- **THEN** the visible message list shows that assistant reply once (persisted bubble only)

#### Scenario: Error still clears streaming

- **WHEN** the completion request fails after streaming has started for the current run
- **THEN** loading is false and no streaming row remains for that session

#### Scenario: Stopped run clears streaming for that run only

- **WHEN** the user stops the current run and streaming UI is cleared for that run
- **THEN** no streaming row remains unless a newer run has already set loading again

#### Scenario: Old run finally does not clear new run

- **WHEN** run R is aborted or finishes after run S has already become current for the same session
- **THEN** R's cleanup MUST NOT set loading false for S or clear S's streaming buffers
