'use client';

import { Button, List, Popconfirm, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useChatStore } from '@/lib/store/chat-store';
import styles from '@/styles/chat/session-rail.module.css';

const { Text } = Typography;

interface SessionRailProps {
  onSessionSelect?: () => void;
}

export function SessionRail({ onSessionSelect }: SessionRailProps) {
  const sessions = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const createSession = useChatStore((s) => s.createSession);
  const setActiveSession = useChatStore((s) => s.setActiveSession);
  const deleteSession = useChatStore((s) => s.deleteSession);
  const loadingBySessionId = useChatStore((s) => s.loadingBySessionId);

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
      <List
        className={styles.list}
        dataSource={sorted}
        renderItem={(session) => {
          const active = session.id === activeSessionId;
          const streaming = Boolean(loadingBySessionId[session.id]);
          return (
            <List.Item
              className={`${styles.item} ${active ? styles.itemActive : ''}`}
              onClick={() => selectSession(session.id)}
              actions={[
                <Popconfirm
                  key="delete"
                  title="删除该会话？"
                  description="消息将一并删除且不可恢复。"
                  okText="删除"
                  cancelText="取消"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    deleteSession(session.id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="删除会话"
                  />
                </Popconfirm>,
              ]}
            >
              <div className={styles.itemBody}>
                <Text ellipsis className={styles.itemTitle}>
                  {session.title}
                </Text>
                {streaming && <span className={styles.streamingDot}>生成中</span>}
              </div>
            </List.Item>
          );
        }}
      />
    </aside>
  );
}
