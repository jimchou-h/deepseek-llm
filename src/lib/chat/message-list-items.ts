import type { Message } from '@/types';

export type MessageListItem =
  | { kind: 'message'; message: Message }
  | { kind: 'streaming'; content: string | null; reasoning: string | null };

export function buildMessageListItems(options: {
  messages: Message[];
  streamingContent: string | null;
  streamingReasoning: string | null;
  isLoading: boolean;
}): MessageListItem[] {
  const items: MessageListItem[] = options.messages.map((message) => ({
    kind: 'message',
    message,
  }));

  const hasStream =
    Boolean(options.streamingContent) || Boolean(options.streamingReasoning);
  if (options.isLoading && hasStream) {
    items.push({
      kind: 'streaming',
      content: options.streamingContent,
      reasoning: options.streamingReasoning,
    });
  }

  return items;
}

export function messageListItemKey(item: MessageListItem, index: number): string {
  if (item.kind === 'streaming') return 'streaming';
  return `msg-${item.message.timestamp}-${index}`;
}
