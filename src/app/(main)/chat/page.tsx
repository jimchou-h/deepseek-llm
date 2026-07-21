'use client';

import { useEffect, useState } from 'react';
import { Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { ChatWindow } from '@/components/chat/chat-window';
import { ChatInput } from '@/components/chat/chat-input';
import { SessionRail } from '@/components/chat/session-rail';
import styles from '@/styles/layout/page-layout.module.css';
import chatShell from '@/styles/chat/chat-shell.module.css';

const NARROW_BREAKPOINT = 900;

export default function ChatPage() {
  const [narrow, setNarrow] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${NARROW_BREAKPOINT}px)`);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.pageContent} ${chatShell.shell}`}>
        {!narrow && <SessionRail />}
        <div className={chatShell.messageColumn}>
          {narrow && (
            <div className={chatShell.mobileBar}>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
                aria-label="打开会话列表"
              >
                会话
              </Button>
            </div>
          )}
          <div className={chatShell.messagePane}>
            <ChatWindow />
          </div>
          <div className={chatShell.inputPane}>
            <ChatInput />
          </div>
        </div>
        <Drawer
          title="会话"
          placement="left"
          open={narrow && drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={280}
          styles={{ body: { padding: 0 } }}
          destroyOnClose={false}
        >
          <div className={chatShell.drawerRail}>
            <SessionRail onSessionSelect={() => setDrawerOpen(false)} />
          </div>
        </Drawer>
      </div>
    </div>
  );
}
