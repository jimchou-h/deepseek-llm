'use client';

import { Button, Popconfirm } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useChatStore } from '@/lib/store/chat-store';
import { useChatStreamingStore } from '@/lib/store/chat-streaming-store';
import styles from '@/styles/chat/session-rail.module.css';

interface SessionRailProps {
  onSessionSelect?: () => void;
}

export function SessionRail({ onSessionSelect }: SessionRailProps) {
  const sessions = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const createSession = useChatStore((s) => s.createSession);
  const setActiveSession = useChatStore((s) => s.setActiveSession);
  const deleteSession = useChatStore((s) => s.deleteSession);
  const loadingBySessionId = useChatStreamingStore((s) => s.loadingBySessionId);

  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  const selectSession = (id: string) => {
    setActiveSession(id);
    onSessionSelect?.();
  };

  return (
    <aside className={styles.rail}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>会话</span>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => {
            createSession();
            onSessionSelect?.();
          }}
        >
          新建
        </Button>
      </div>
      <div className={styles.list} role="list">
        {sorted.map((session) => {
          const active = session.id === activeSessionId;
          const streaming = Boolean(loadingBySessionId[session.id]);
          return (
            <div
              key={session.id}
              role="listitem"
              className={`${styles.item} ${active ? styles.itemActive : ''}`}
              onClick={() => selectSession(session.id)}
            >
              <div className={styles.itemBody}>
                <span className={styles.itemTitle} title={session.title}>
                  {session.title}
                </span>
                {streaming && <span className={styles.streamingDot}>生成中</span>}
              </div>
              <Popconfirm
                title="删除该会话？"
                description="消息将一并删除且不可恢复。"
                okText="删除"
                cancelText="取消"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    deleteSession(session.id);
                    useChatStreamingStore.getState().clearAllForSession(session.id);
                  }}
                onCancel={(e) => e?.stopPropagation()}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  className={styles.deleteBtn}
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="删除会话"
                />
              </Popconfirm>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
