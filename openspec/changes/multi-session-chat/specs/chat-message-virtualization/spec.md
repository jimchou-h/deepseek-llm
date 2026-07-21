## ADDED Requirements

### Requirement: Virtualize message list

The message pane SHALL render the active session's messages using a virtualized list so that only viewport-adjacent message nodes are mounted in the DOM.

#### Scenario: Long conversation DOM bound

- **WHEN** the active session contains a large number of messages (e.g. hundreds)
- **THEN** the number of mounted message bubble DOM nodes remains on the order of the viewport capacity, not the full message count

### Requirement: Dynamic height and streaming updates

The virtualized list SHALL support variable-height message bubbles (including markdown, code, and reasoning content) and SHALL update the last streaming bubble without remounting the entire list.

#### Scenario: Streaming append

- **WHEN** streaming tokens arrive for the active session
- **THEN** the streaming message content updates in place
- **AND** if the user is pinned near the bottom, the list SHALL follow new output

#### Scenario: User scrolled up

- **WHEN** the user has scrolled away from the bottom during streaming
- **THEN** the list SHALL NOT force-scroll to the bottom until the user returns near the bottom

### Requirement: No heavy list-level motion

The message list SHALL NOT use list-wide layout animation libraries (e.g. Framer Motion `AnimatePresence`/`layout` over all items) that fight virtualization. Entry motion, if any, SHALL be limited to lightweight CSS on newly inserted items.

#### Scenario: List renders without layout animation tree

- **WHEN** messages are rendered in the message pane
- **THEN** they are not wrapped in a full-list `AnimatePresence`/`layout` animation tree
