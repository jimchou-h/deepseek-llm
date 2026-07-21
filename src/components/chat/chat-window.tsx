'use client';

import { Message } from '@/types';
import { useChatStore } from '@/lib/store/chat-store';
import { formatDate } from '@/lib/utils';
import { Card, Avatar, Spin, Button, Popconfirm, message as antdMessage } from 'antd';
import { UserOutlined, RobotOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageContent } from './message-content';
import { MessageContentR1 } from './message-content-r1';
import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/chat/chat-window.module.css';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyMessage = async (message: Message) => {
    try {
      let fullContent = '';
      if (message.reasoning_content) {
        fullContent += `思考过程:\n${message.reasoning_content}\n\n`;
      }
      fullContent += message.content;

      await navigator.clipboard.writeText(fullContent);
      setCopiedMessageId(message.timestamp);
      antdMessage.success('消息已复制到剪贴板');
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      antdMessage.error('复制失败');
    }
  };

  useEffect(() => {
    const messageList = document.querySelector(`.${styles.messageList}`);
    if (!messageList) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messageList;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    };

    messageList.addEventListener('scroll', handleScroll);
    return () => messageList.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage, currentStreamingReasoningMessage, shouldAutoScroll]);

  return (
    <div className={styles.container}>
      <div className={styles.messageList}>
        <AnimatePresence mode="popLayout">
          {messages.map((message: Message) => (
            <motion.div
              key={message.timestamp}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              layout
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
                      className={
                        copiedMessageId === message.timestamp
                          ? 'text-blue-500'
                          : 'text-gray-400 hover:text-blue-500'
                      }
                      onClick={() => handleCopyMessage(message)}
                    />
                    <Popconfirm
                      title="确定要删除这条消息吗？"
                      onConfirm={() => {
                        if (activeSessionId) {
                          deleteMessage(activeSessionId, message.timestamp);
                        }
                      }}
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
                    <div className={styles.messageTime}>
                      {formatDate(message.timestamp)}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          {(currentStreamingMessage || currentStreamingReasoningMessage) && (
            <motion.div
              key="streaming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${styles.messageWrapper} ${styles.messageWrapperAssistant}`}
            >
              <Card
                size="small"
                className={`${styles.messageCard} ${styles.messageCardAssistant}`}
                bordered={false}
                extra={
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      size="small"
                      className="text-gray-400 hover:text-blue-500"
                      onClick={() => {
                        let fullContent = '';
                        if (currentStreamingReasoningMessage) {
                          fullContent += `思考过程:\n${currentStreamingReasoningMessage}\n\n`;
                        }
                        if (currentStreamingMessage) {
                          fullContent += currentStreamingMessage;
                        }
                        navigator.clipboard.writeText(fullContent);
                        antdMessage.success('消息已复制到剪贴板');
                      }}
                    />
                  </div>
                }
              >
                <div className={styles.messageContent}>
                  <Avatar icon={<RobotOutlined />} className="bg-blue-500" />
                  <div className={styles.messageText}>
                    {currentStreamingReasoningMessage && (
                      <div className={styles.messageReasoning}>
                        <div className={styles.messageReasoningTitle}>R1思考中...</div>
                        <MessageContentR1 content={currentStreamingReasoningMessage} />
                      </div>
                    )}
                    {currentStreamingMessage && (
                      <div className={styles.messageTextContent}>
                        <MessageContent content={currentStreamingMessage} />
                      </div>
                    )}
                    <div className={styles.messageTime}>{formatDate(Date.now())}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        {isLoading && !currentStreamingMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.loadingWrapper}
          >
            <Spin tip="AI思考中..." />
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
