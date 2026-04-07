'use client';

import { ChatWindow } from '@/components/chat/chat-window';
import { ChatInput } from '@/components/chat/chat-input';
import styles from '@/styles/layout/page-layout.module.css';

export default function ChatPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageContent}>
        <div className="flex-1 min-h-0 bg-gray-50">
          <ChatWindow />
        </div>
        <div className="border-t bg-white">
          <ChatInput />
        </div>
      </div>
    </div>
  );
} 