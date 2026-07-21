'use client';

import { ChatWindow } from '@/components/chat/chat-window';
import { ChatInput } from '@/components/chat/chat-input';
import { SessionRail } from '@/components/chat/session-rail';
import styles from '@/styles/layout/page-layout.module.css';
import chatShell from '@/styles/chat/chat-shell.module.css';

export default function ChatPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.pageContent} ${chatShell.shell}`}>
        <SessionRail />
        <div className={chatShell.messageColumn}>
          <div className={chatShell.messagePane}>
            <ChatWindow />
          </div>
          <div className={chatShell.inputPane}>
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  );
}
