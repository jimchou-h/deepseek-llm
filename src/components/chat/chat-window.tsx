'use client';

import { Message } from '@/types';
import { useChatStore } from '@/lib/store/chat-store';
import { formatDate } from '@/lib/utils';
import { Card, Avatar, Spin, Button, Popconfirm, message as antdMessage } from 'antd';
import { UserOutlined, RobotOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { Virtuoso } from 'react-virtuoso';
import { MessageContent } from './message-content';
import { MessageContentR1 } from './message-content-r1';
import { useMemo, useState } from 'react';
import {
  buildMessageListItems,
  messageListItemKey,
  type MessageListItem,
} from '@/lib/chat/message-list-items';
import styles from '@/styles/chat/chat-window.module.css';

function MessageBubble({
  message,
  onDelete,
}: {
  message: Message;
  onDelete: (timestamp: number) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      let fullContent = '';
      if (message.reasoning_content) {
        fullContent += `思考过程:\n${message.reasoning_content}\n\n`;
      }
      fullContent += message.content;
      await navigator.clipboard.writeText(fullContent);
      setCopied(true);
      antdMessage.success('消息已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      antdMessage.error('复制失败');
    }
  };

  return (
    <div
      className={`${styles.messageWrapper} ${
        message.role === 'assistant'
          ? styles.messageWrapperAssistant
          : styles.messageWrapperUser
      }`}
    >
      <Card
        size="small"
        className={`${styles.messageCard} ${
          message.role === 'assistant'
            ? styles.messageCardAssistant
            : styles.messageCardUser
        }`}
        bordered={false}
        extra={
          <div style={{ display: 'flex', gap: '4px' }}>
            <Button
              type="text"
              icon={<CopyOutlined />}
              size="small"
              className={copied ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}
              onClick={handleCopy}
            />
            <Popconfirm
              title="确定要删除这条消息吗？"
              onConfirm={() => onDelete(message.timestamp)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                className="text-gray-400 hover:text-red-500"
              />
            </Popconfirm>
          </div>
        }
      >
        <div className={styles.messageContent}>
          <Avatar
            icon={message.role === 'assistant' ? <RobotOutlined /> : <UserOutlined />}
            className={message.role === 'assistant' ? 'bg-blue-500' : 'bg-green-500'}
          />
          <div className={styles.messageText}>
            {message.reasoning_content && (
              <div className={styles.messageReasoning}>
                <div className={styles.messageReasoningTitle}>R1思考过程:</div>
                <MessageContentR1 content={message.reasoning_content} />
              </div>
            )}
            <div className={styles.messageTextContent}>
              <MessageContent content={message.content} />
            </div>
            <div className={styles.messageTime}>{formatDate(message.timestamp)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StreamingBubble({
  content,
  reasoning,
}: {
  content: string | null;
  reasoning: string | null;
}) {
  return (
    <div className={`${styles.messageWrapper} ${styles.messageWrapperAssistant}`}>
      <Card
        size="small"
        className={`${styles.messageCard} ${styles.messageCardAssistant}`}
        bordered={false}
        extra={
          <Button
            type="text"
            icon={<CopyOutlined />}
            size="small"
            className="text-gray-400 hover:text-blue-500"
            onClick={() => {
              let fullContent = '';
              if (reasoning) fullContent += `思考过程:\n${reasoning}\n\n`;
              if (content) fullContent += content;
              navigator.clipboard.writeText(fullContent);
              antdMessage.success('消息已复制到剪贴板');
            }}
          />
        }
      >
        <div className={styles.messageContent}>
          <Avatar icon={<RobotOutlined />} className="bg-blue-500" />
          <div className={styles.messageText}>
            {reasoning && (
              <div className={styles.messageReasoning}>
                <div className={styles.messageReasoningTitle}>R1思考中...</div>
                <MessageContentR1 content={reasoning} />
              </div>
            )}
            {content && (
              <div className={styles.messageTextContent}>
                <MessageContent content={content} />
              </div>
            )}
            <div className={styles.messageTime}>{formatDate(Date.now())}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export const ChatWindow = () => {
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const sessions = useChatStore((state) => state.sessions);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const isLoading = useChatStore((state) =>
    state.isSessionLoading(state.activeSessionId)
  );
  const currentStreamingMessage = useChatStore(
    (state) => state.getSessionStreaming(state.activeSessionId).content
  );
  const currentStreamingReasoningMessage = useChatStore(
    (state) => state.getSessionStreaming(state.activeSessionId).reasoning
  );

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];

  const items = useMemo(
    () =>
      buildMessageListItems({
        messages,
        streamingContent: currentStreamingMessage,
        streamingReasoning: currentStreamingReasoningMessage,
      }),
    [messages, currentStreamingMessage, currentStreamingReasoningMessage]
  );

  const renderItem = (_index: number, item: MessageListItem) => {
    if (item.kind === 'streaming') {
      return (
        <div className={styles.virtuosoItem}>
          <StreamingBubble content={item.content} reasoning={item.reasoning} />
        </div>
      );
    }
    return (
      <div className={styles.virtuosoItem}>
        <MessageBubble
          message={item.message}
          onDelete={(timestamp) => {
            if (activeSessionId) deleteMessage(activeSessionId, timestamp);
          }}
        />
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Virtuoso
        className={styles.messageList}
        data={items}
        computeItemKey={(index, item) => messageListItemKey(item, index)}
        itemContent={renderItem}
        followOutput="smooth"
        increaseViewportBy={{ top: 200, bottom: 200 }}
        components={{
          Footer: () =>
            isLoading && !currentStreamingMessage ? (
              <div className={styles.loadingWrapper}>
                <Spin tip="AI思考中..." />
              </div>
            ) : (
              <div style={{ height: 8 }} />
            ),
        }}
      />
    </div>
  );
};
