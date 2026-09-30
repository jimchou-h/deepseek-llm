'use client';

import { useRef, useState } from 'react';
import { Input, Button, message, Tooltip, Modal } from 'antd';
import {
  SendOutlined,
  DeleteOutlined,
  DownloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useChatStore } from '@/lib/store/chat-store';
import { useChatStreamingStore } from '@/lib/store/chat-streaming-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { chatCompletion } from '@/lib/api/deepseek';
import { useChatShortcuts } from '@/hooks/use-chat-shortcuts';
import { buildApiMessages } from '@/lib/chat/context-window';
import { createRafThrottle } from '@/lib/chat/raf-throttle';
import {
  abortSessionRun,
  clearSessionRunIf,
  isCurrentRun,
  startSessionRun,
} from '@/lib/chat/session-run';
import styles from '@/styles/chat/chat-input.module.css';
import { TemplateSelector } from './template-selector';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { Message } from '@/types';

const EMPTY_MESSAGES: Message[] = [];

export const ChatInput = () => {
  const [input, setInput] = useState('');
  /** 累积正文，停止时可对照（主落盘仍用 response.content） */
  const partialRef = useRef({ content: '', reasoning: '' });

  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const messages = useChatStore((s) => {
    const id = s.activeSessionId;
    if (!id) return EMPTY_MESSAGES;
    return s.sessions.find((session) => session.id === id)?.messages ?? EMPTY_MESSAGES;
  });
  const addMessage = useChatStore((s) => s.addMessage);
  const clearMessages = useChatStore((s) => s.clearMessages);

  const isLoading = useChatStreamingStore((s) =>
    Boolean(activeSessionId && s.loadingBySessionId[activeSessionId])
  );

  const { settings, apiKey, updateSettings } = useSettingsStore();

  const persistAssistantIfNeeded = (
    sessionId: string,
    content: string,
    reasoning: string
  ) => {
    if (!content.trim() && !reasoning.trim()) return;
    addMessage(sessionId, {
      role: 'assistant',
      content,
      timestamp: Date.now(),
      reasoning_content: reasoning,
    });
  };

  const sendMessage = async (content: string) => {
    if (!apiKey) {
      message.error('请先设置 API Key');
      return;
    }

    const sessionId = useChatStore.getState().activeSessionId;
    if (!sessionId) {
      message.error('没有活跃会话');
      return;
    }

    // 同会话新 run 会 abort 旧 controller；旧 finally 靠 runId 校验不清理新任务
    const run = startSessionRun(sessionId);
    const streaming = useChatStreamingStore.getState();
    const sessionMessages =
      useChatStore.getState().sessions.find((s) => s.id === sessionId)?.messages ?? [];

    const userMessage = {
      role: 'user' as const,
      content: content.trim(),
      timestamp: Date.now(),
    };

    const pushContent = createRafThrottle((value) => {
      if (!isCurrentRun(sessionId, run.runId)) return;
      useChatStreamingStore.getState().setStreamingContent(sessionId, value);
    });
    const pushReasoning = createRafThrottle((value) => {
      if (!isCurrentRun(sessionId, run.runId)) return;
      useChatStreamingStore.getState().setStreamingReasoning(sessionId, value);
    });

    partialRef.current = { content: '', reasoning: '' };

    try {
      addMessage(sessionId, userMessage);
      streaming.setLoading(sessionId, true);
      streaming.setStreamingContent(sessionId, '');
      streaming.setStreamingReasoning(sessionId, '');

      const contextMessageLimit = useChatStore.getState().contextMessageLimit;
      const messageList = buildApiMessages({
        systemPrompt: settings.systemPrompt,
        messages: [...sessionMessages, userMessage],
        limit: contextMessageLimit,
      });

      let streamContent = '';
      let reasoningContent = '';

      const response = await chatCompletion(
        messageList as ChatCompletionMessageParam[],
        settings,
        apiKey,
        (chunk: string) => {
          if (!isCurrentRun(sessionId, run.runId)) return;
          streamContent += chunk;
          partialRef.current.content = streamContent;
          pushContent(streamContent);
        },
        (chunk: string) => {
          if (!isCurrentRun(sessionId, run.runId)) return;
          reasoningContent += chunk;
          partialRef.current.reasoning = reasoningContent;
          pushReasoning(reasoningContent);
        },
        run.controller.signal
      );

      if (!isCurrentRun(sessionId, run.runId)) {
        return;
      }

      if (response.status === 'aborted') {
        persistAssistantIfNeeded(sessionId, response.content, response.reasoningContent);
        return;
      }

      if (response.status === 'incomplete') {
        persistAssistantIfNeeded(sessionId, response.content, response.reasoningContent);
        message.warning('连接中断，已保存已接收的部分回复');
        return;
      }

      persistAssistantIfNeeded(sessionId, response.content, response.reasoningContent);
    } catch (error) {
      if (!isCurrentRun(sessionId, run.runId)) {
        return;
      }
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('发送消息失败，请重试');
      }
      console.error(error);
    } finally {
      pushContent.cancel();
      pushReasoning.cancel();
      // 代际校验：旧 run 不得清掉新 run 的 loading / streaming
      if (isCurrentRun(sessionId, run.runId)) {
        useChatStreamingStore.getState().setLoading(sessionId, false);
        useChatStreamingStore.getState().clearSessionStreaming(sessionId);
        clearSessionRunIf(sessionId, run.runId);
      }
    }
  };

  /** 停止接收：只 abort 浏览器读流，不保证上游模型立刻停 */
  const handleStop = () => {
    if (!activeSessionId) return;
    abortSessionRun(activeSessionId);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  useChatShortcuts({
    onSend: handleSubmit,
    onClear: () => {
      if (messages.length > 0 && activeSessionId) {
        Modal.confirm({
          title: '确认清空',
          content: '确定要清空当前会话的对话记录吗？此操作不可恢复。',
          onOk: () => clearMessages(activeSessionId),
        });
      }
    },
  });

  const handleExport = () => {
    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        time: new Date(msg.timestamp).toLocaleString(),
      }));

      const blob = new Blob([JSON.stringify(chatHistory, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-history-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch {
      message.error('导出失败');
    }
  };

  const handleClear = () => {
    if (messages.length > 0 && activeSessionId) {
      Modal.confirm({
        title: '确认清空',
        content: '确定要清空当前会话的对话记录吗？此操作不可恢复。',
        onOk: () => clearMessages(activeSessionId),
      });
    }
  };

  const handleTemplateSelect = async (prompt: string) => {
    if (isLoading || !activeSessionId) return;
    updateSettings({ systemPrompt: prompt });
    clearMessages(activeSessionId);
    message.success('已应用模板，当前会话已重置');
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <TemplateSelector onSelect={handleTemplateSelect} disabled={isLoading} />
        <div className={styles.toolbarActions}>
          <Tooltip title="导出对话">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={messages.length === 0}
            />
          </Tooltip>
          <Tooltip title="清空对话">
            <Button
              icon={<DeleteOutlined />}
              onClick={handleClear}
              disabled={messages.length === 0}
            />
          </Tooltip>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputWrapper}>
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息... (Ctrl + Enter 发送)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            className={styles.textarea}
            disabled={isLoading}
          />
          {isLoading ? (
            <Tooltip title="停止接收（上游模型可能仍继续生成）">
              <Button
                danger
                icon={<StopOutlined />}
                onClick={handleStop}
                className={styles.sendButton}
              >
                停止
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="发送 (Ctrl + Enter)">
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => handleSubmit()}
                className={styles.sendButton}
              >
                发送
              </Button>
            </Tooltip>
          )}
        </div>
      </form>
    </div>
  );
};
