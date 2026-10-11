'use client';

import React, { memo, useState, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button, message, Spin } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

const LazyCodeBlock = lazy(() =>
  import('./code-block').then((m) => ({ default: m.CodeBlock }))
);

interface MessageContentProps {
  content: string;
}

export const MessageContent = memo(function MessageContent({ content }: MessageContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      message.success('代码已复制');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      message.error('复制失败');
    }
  };

  return (
    <ReactMarkdown
      components={{
        code: ({ inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const code = String(children).replace(/\n$/, '');

          if (!inline && match) {
            return (
              <Suspense fallback={<pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-sm">{code}</pre>}>
                <LazyCodeBlock
                  language={match[1]}
                  code={code}
                  onCopy={handleCopyCode}
                  isCopied={copiedCode === code}
                />
              </Suspense>
            );
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
});
