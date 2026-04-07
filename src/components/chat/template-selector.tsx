'use client';

import { Select, Tooltip } from 'antd';
import { useTemplateStore } from '@/lib/store/template-store';
import { BookOutlined } from '@ant-design/icons';
import styles from '@/styles/chat/template-selector.module.css';
import { useState } from 'react';

interface TemplateSelectorProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function TemplateSelector({ onSelect, disabled }: TemplateSelectorProps) {
  const templates = useTemplateStore((state) => state.templates);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleChange = (id: string | null) => {
    setSelectedId(id);
    if (id) {
      const template = templates.find(t => t.id === id);
      if (template) {
        onSelect(template.prompt);
      }
    }
  };

  return (
    <div className={styles.container}>
      <Select
        placeholder={
          <span>
            <BookOutlined /> 选择提示词模板
          </span>
        }
        className={styles.select}
        options={templates.map(template => ({
          label: (
            <Tooltip title={template.description}>
              <div className={styles.option}>
                <span>{template.title}</span>
                <span className={styles.category}>{template.category}</span>
              </div>
            </Tooltip>
          ),
          value: template.id
        }))}
        onChange={handleChange}
        disabled={disabled}
        allowClear
        value={selectedId}
      />
    </div>
  );
} 