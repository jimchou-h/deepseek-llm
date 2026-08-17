## ADDED Requirements

### Requirement: Ink console color tokens

The application SHALL apply a single ink-console palette across chat, navigation, settings, templates, and workflows. Named tokens SHALL be Ink `#08131F`, Panel `#0E1C2E`, Deck `#122033`, Line `#1A3A52`, Signal `#3BA7FF`, Text `#DCE8F5`, and Dim `#7A93AB`. The Ant Design primary color SHALL match Signal. Surfaces SHALL NOT use a light page canvas as the default chrome.

#### Scenario: Chat page uses deck background

- **WHEN** the user opens the chat page
- **THEN** the message column background uses Deck (or a derived Ink/Deck treatment), not a light gray or white canvas

#### Scenario: Settings inherits the same tokens

- **WHEN** the user opens settings, templates, or workflows
- **THEN** page chrome and Ant Design containers use the same Ink/Panel/Line/Text tokens as chat (no light-theme island)

### Requirement: Instrument typography

The application SHALL load Noto Sans SC for body and Chinese UI text, Chakra Petch for the product logo and sparse titles, and IBM Plex Mono for timestamps, R1 reasoning, and code. Chinese copy SHALL NOT be forced into the Latin display face.

#### Scenario: Logo uses display face

- **WHEN** the main layout logo is visible
- **THEN** it is set in Chakra Petch

#### Scenario: Message body remains readable Chinese

- **WHEN** an assistant message contains Chinese prose
- **THEN** the prose uses Noto Sans SC (or the body font stack), not Chakra Petch

### Requirement: Message pane instrument signature

The chat message pane SHALL present a faint technical grid. Assistant message bubbles SHALL show a vertical Signal-colored indicator on the left edge. User message bubbles SHALL remain on the trailing side without that indicator. Ambient animation other than the streaming breath specified in this change SHALL NOT be added to the chrome.

#### Scenario: Assistant bubble shows signal rail

- **WHEN** a completed assistant message is rendered
- **THEN** the bubble has a left Signal indicator and sits on the faint grid of the message pane

#### Scenario: User bubble has no signal rail

- **WHEN** a user message is rendered
- **THEN** the bubble has no left Signal indicator

### Requirement: Streaming indicator breathes only while generating

The assistant streaming bubble SHALL breathe the left Signal indicator while that session is generating. When `prefers-reduced-motion: reduce` is set, the indicator SHALL remain steadily lit instead of animating. Idle chrome SHALL NOT run looping environmental motion (grid drift, scanlines, particles).

#### Scenario: Breath during stream

- **WHEN** the active session is loading and a streaming assistant bubble is shown
- **THEN** its left Signal indicator uses a breathing animation

#### Scenario: Reduced motion disables breath

- **WHEN** the user prefers reduced motion and a streaming bubble is shown
- **THEN** the Signal indicator is visible and not animated
