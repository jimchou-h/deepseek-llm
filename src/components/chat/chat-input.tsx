'use client';

import { useState } from 'react';
import { Input, Button, message, Tooltip, Modal, Upload } from 'antd';
import { SendOutlined, DeleteOutlined, DownloadOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useChatStore } from '@/lib/store/chat-store';
import { useChatStreamingStore } from '@/lib/store/chat-streaming-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { chatCompletion } from '@/lib/api/deepseek';
import { openUploadFile } from '@/lib/api/deepseekopenapi';
import { useChatShortcuts } from '@/hooks/use-chat-shortcuts';
import { buildApiMessages } from '@/lib/chat/context-window';
import { createRafThrottle } from '@/lib/chat/raf-throttle';
import styles from '@/styles/chat/chat-input.module.css';
import { TemplateSelector } from './template-selector';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Message } from '@/types';

const EMPTY_MESSAGES: Message[] = [];

export const ChatInput = () => {
  const [input, setInput] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);

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

  const handleFileUpload = async (file: File) => {
    if (!apiKey) {
      message.error('请先设置 API Key');
      return Upload.LIST_IGNORE;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('文件必须小于10MB！');
      return Upload.LIST_IGNORE;
    }

    try {
      const result = await openUploadFile(file, apiKey);
      if (result.code === 0) {
        setUploadedFileIds((prev) => [...prev, result.data.biz_data.id]);
        message.success(`文件 "${file.name}" 上传成功`);
        return true;
      }
      message.error(result.msg || '文件上传失败');
      return Upload.LIST_IGNORE;
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('文件上传失败');
      }
      return Upload.LIST_IGNORE;
    }
  };

  const handleFileRemove = (file: UploadFile) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const sendMessage = async (content: string, reasoning_content?: string) => {
    if (!apiKey) {
      message.error('请先设置 API Key');
      return;
    }

    const sessionId = useChatStore.getState().activeSessionId;
    if (!sessionId) {
      message.error('没有活跃会话');
      return;
    }

    const streaming = useChatStreamingStore.getState();
    const sessionMessages =
      useChatStore.getState().sessions.find((s) => s.id === sessionId)?.messages ?? [];

    const userMessage = {
      role: 'user' as const,
      content: content.trim(),
      timestamp: Date.now(),
      reasoning_content: reasoning_content ? reasoning_content.trim() : '',
    };

    const pushContent = createRafThrottle((value) => {
      useChatStreamingStore.getState().setStreamingContent(sessionId, value);
    });
    const pushReasoning = createRafThrottle((value) => {
      useChatStreamingStore.getState().setStreamingReasoning(sessionId, value);
    });

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
          streamContent += chunk;
          pushContent(streamContent);
        },
        (chunk: string) => {
          reasoningContent += chunk;
          pushReasoning(reasoningContent);
        }
      );

      addMessage(sessionId, {
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        reasoning_content: response.reasoningContent,
      });

      setFileList([]);
      setUploadedFileIds([]);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('发送消息失败，请重试');
      }
      console.error(error);
    } finally {
      pushContent.cancel();
      pushReasoning.cancel();
      useChatStreamingStore.getState().setLoading(sessionId, false);
      useChatStreamingStore.getState().clearSessionStreaming(sessionId);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    await sendMessage(input);
    setInput('');
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
            placeholder={
              fileList.length > 0
                ? '请输入关于文件的问题...'
                : '输入消息... (Ctrl + Enter 发送)'
            }
            autoSize={{ minRows: 1, maxRows: 4 }}
            className={styles.textarea}
          />
          <Tooltip title="发送 (Ctrl + Enter)">
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSubmit()}
              loading={isLoading}
              className={styles.sendButton}
            >
              发送
            </Button>
          </Tooltip>
        </div>
        {fileList.length > 0 && (
          <div className={styles.fileList}>
            {fileList.map((file) => (
              <div key={file.uid} className={styles.fileItem}>
                <PaperClipOutlined /> {file.name}
                <Button
                  type="text"
                  size="small"
                  danger
                  onClick={() => handleFileRemove(file)}
                >
                  移除
                </Button>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};
