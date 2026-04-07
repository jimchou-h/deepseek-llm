'use client';

import { useEffect } from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import { Template, CreateTemplateInput } from '@/types/template';

interface TemplateFormProps {
  data?: Partial<Template>;
  onSubmit: (values: CreateTemplateInput) => void;
  onCancel: () => void;
}

export function TemplateForm({ data, onSubmit, onCancel }: TemplateFormProps) {
  const [form] = Form.useForm<CreateTemplateInput>();

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
    >
      <Form.Item
        label="标题"
        name="title"
        rules={[{ required: true, message: '请输入模板标题' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="描述"
        name="description"
        rules={[{ required: true, message: '请输入模板描述' }]}
      >
        <Input.TextArea rows={2} />
      </Form.Item>

      <Form.Item
        label="提示词"
        name="prompt"
        rules={[{ required: true, message: '请输入提示词内容' }]}
      >
        <Input.TextArea rows={6} />
      </Form.Item>

      <Form.Item
        label="分类"
        name="category"
        rules={[{ required: true, message: '请选择模板分类' }]}
      >
        <Select>
          <Select.Option value="general">通用</Select.Option>
          <Select.Option value="code">代码</Select.Option>
          <Select.Option value="writing">写作</Select.Option>
          <Select.Option value="analysis">分析</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="标签" name="tags">
        <Select mode="tags" />
      </Form.Item>

      <Form.Item className="mb-0">
        <Space>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
} 