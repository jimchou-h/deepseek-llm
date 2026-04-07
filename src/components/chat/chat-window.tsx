'use client';

import { Message } from '@/types';
import { useChatStore } from '@/lib/store/chat-store';
import { formatDate } from '@/lib/utils';
import { Card, Avatar, Spin, Image } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageContent } from './message-content';
import { MessageContentR1 } from './message-content-r1';
import { useEffect, useRef } from 'react';
import styles from '@/styles/chat/chat-window.module.css';

export const ChatWindow = () => {
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const currentStreamingMessage = useChatStore((state) => state.currentStreamingMessage);
  const currentStreamingReasoningMessage = useChatStore((state) => state.currentStreamingReasoningMessage);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage, currentStreamingReasoningMessage]);

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
              >
                <div className={styles.messageContent}>
                  <Avatar
                    icon={message.role === 'assistant' ? <RobotOutlined /> : <UserOutlined />}
                    className={message.role === 'assistant' ? 'bg-blue-500' : 'bg-green-500'}
                  />
                  <div className={styles.messageText}>
                    {message.reasoning_content && (
                      <div className={styles.messageReasoning}>
                        <div className={styles.messageReasoningTitle}>
                          R1思考过程:
                        </div>
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
              >
                <div className={styles.messageContent}>
                  <Avatar
                    icon={<RobotOutlined />}
                    className="bg-blue-500"
                  />
                  <div className={styles.messageText}>
                    {
                      currentStreamingReasoningMessage && <div className={styles.messageReasoning}>
                      <div className={styles.messageReasoningTitle}>
                        R1思考中...
                      </div>
                      <MessageContentR1 content={currentStreamingReasoningMessage} />
                    </div>
                    }
                    {
                      currentStreamingMessage && <div className={styles.messageTextContent}>
                        <MessageContent content={currentStreamingMessage} />
                      </div>
                    }
                    <div className={styles.messageTime}>
                      {formatDate(Date.now())}
                    </div>
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