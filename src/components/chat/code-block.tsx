'use client';

import { memo } from 'react';
import { Button } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('shell', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('md', markdown);

export const CodeBlock = memo(function CodeBlock({
  language,
  code,
  onCopy,
  isCopied,
}: {
  language: string;
  code: string;
  onCopy: (code: string) => void;
  isCopied: boolean;
}) {
  return (
    <div className="relative group">
      <Button
        type="text"
        size="small"
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white"
        icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
        onClick={() => onCopy(code)}
      />
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 10, fontSize: 13 }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
});
