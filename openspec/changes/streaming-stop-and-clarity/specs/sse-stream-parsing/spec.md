## ADDED Requirements

### Requirement: SSE chunks are decoded and buffered safely

The streaming client SHALL decode byte chunks with a streaming TextDecoder and SHALL assemble SSE events using a buffer so that multi-byte characters and event boundaries are not corrupted by TCP/HTTP chunk splits.

#### Scenario: Multi-byte character across chunks

- **WHEN** a UTF-8 character is split across two read() chunks
- **THEN** decoding with stream mode MUST NOT emit a replacement character for the incomplete prefix
- **AND** the full character appears after the subsequent chunk is decoded

#### Scenario: Partial SSE event waits in buffer

- **WHEN** a read chunk ends in the middle of an SSE event
- **THEN** the incomplete portion remains in the buffer
- **AND** it is only emitted after a later chunk completes the event boundary

#### Scenario: Multiple events in one chunk

- **WHEN** one read chunk contains multiple complete SSE events
- **THEN** the parser SHALL yield each complete event in order
