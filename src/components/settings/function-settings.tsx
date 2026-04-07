'use client';

import { useState } from 'react';
import { Form, Input, Select, Button, Card, List, Modal, Tag, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApiOutlined, ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useSettingsStore } from '@/lib/store/settings-store';
import { FunctionDefinition } from '@/types';
import { FunctionTestModal } from './function-test-modal';

interface FunctionFormData {
  name: string;
  description: string;
  url: string;
  method: 'GET' | 'POST';
  parameters: {
    type: 'object';
    properties: string | Record<string, {
      type: string;
      description?: string;
      enum?: string[];
    }>;
    required: string[];
  };
  headers?: string | Record<string, string>;
}

export function FunctionSettings() {
  const { settings, updateSettings, resetFunctions } = useSettingsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFunction, setEditingFunction] = useState<FunctionDefinition | null>(null);
  const [form] = Form.useForm<FunctionFormData>();
  const [testingFunction, setTestingFunction] = useState<FunctionDefinition | null>(null);

  const handleSubmit = (values: FunctionFormData) => {
    try {
      // 解析 JSON 字符串
      const parameters = {
        type: 'object' as const,
        properties: typeof values.parameters.properties === 'string' 
          ? JSON.parse(values.parameters.properties)
          : values.parameters.properties,
        required: values.parameters.required,
      };

      const headers = values.headers && typeof values.headers === 'string'
        ? JSON.parse(values.headers)
        : values.headers;

      const newFunction: FunctionDefinition = {
        ...values,
        parameters,
        headers,
        id: editingFunction?.id || `func_${Date.now()}`,
      };

      const updatedFunctions = editingFunction
        ? settings.functions.map(f => (f.id === editingFunction.id ? newFunction : f))
        : [...(settings.functions || []), newFunction];

      updateSettings({ ...settings, functions: updatedFunctions });
      setIsModalOpen(false);
      setEditingFunction(null);
      form.resetFields();
    } catch (error) {
      console.error('表单提交错误:', error);
    }
  };

  const handleDelete = (id: string) => {
    const updatedFunctions = (settings.functions || []).filter(f => f.id !== id);
    updateSettings({ ...settings, functions: updatedFunctions });
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingFunction(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          添加函数
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            Modal.confirm({
              title: '重置函数配置',
              content: '确定要重置为默认函数配置吗？这将删除所有自定义函数。',
              onOk: () => {
                resetFunctions();
                message.success('函数配置已重置');
              },
            });
          }}
        >
          重置默认配置
        </Button>
      </div>

      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={settings.functions || []}
        renderItem={(func: FunctionDefinition) => (
          <List.Item>
            <Card
              title={
                <div>
                  <ApiOutlined />
                  {func.name}
                  <Tag color="blue">{func.method}</Tag>
                  <div className="flex-1">
                    <Button
                      key="edit"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingFunction(func);
                        form.setFieldsValue({
                          ...func,
                          parameters: {
                            ...func.parameters,
                            properties: JSON.stringify(func.parameters.properties, null, 2),
                          },
                          headers: func.headers ? JSON.stringify(func.headers, null, 2) : undefined,
                        });
                        setIsModalOpen(true);
                      }}
                    />
                    <Button
                      key="delete"
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => handleDelete(func.id)}
                    />
                    <Button
                      key="test"
                      icon={<ThunderboltOutlined />}
                      onClick={() => setTestingFunction(func)}
                    >
                      测试
                    </Button>
                  </div>
                </div>
              }
              extra={[
                
              ]}
            >
              <p className="text-gray-500">{func.description}</p>
              <div className="mt-2">
                <strong>URL:</strong>
                <div className="mt-1 break-all text-gray-600 text-sm">
                  {func.url}
                </div>
              </div>
              <div className="mt-2">
                <strong>参数:</strong>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.entries(func.parameters.properties).map(([key, value]) => (
                    <Tag key={key} className="mb-1">
                      {key}
                      {func.parameters.required.includes(key) && <span className="text-red-500">*</span>}
                    </Tag>
                  ))}
                </div>
              </div>
              {func.headers && (
                <div className="mt-2">
                  <strong>请求头:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.keys(func.headers).map(key => (
                      <Tag key={key} color="green">{key}</Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={editingFunction ? '编辑函数' : '添加函数'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingFunction(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="函数名称"
            rules={[{ required: true }]}
          >
            <Input placeholder="例如: get_weather" />
          </Form.Item>
          <Form.Item
            name="description"
            label="函数描述"
            rules={[{ required: true }]}
          >
            <Input.TextArea placeholder="描述函数的功能..." />
          </Form.Item>
          <Form.Item
            name="url"
            label="API URL"
            rules={[{ required: true }]}
          >
            <Input placeholder="https://api.example.com/endpoint/{param}" />
          </Form.Item>
          <Form.Item
            name="method"
            label="请求方法"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name={['parameters', 'properties']}
            label="参数定义"
            rules={[{ required: true }]}
            help="支持嵌套的 map 类型，可以定义对象内的字段结构"
          >
            <Input.TextArea 
              placeholder={JSON.stringify({
                simple_param: { 
                  type: 'string', 
                  description: '简单参数示例' 
                },
                map_param: { 
                  type: 'object',
                  description: 'Map类型参数示例',
                  properties: {
                    key1: { type: 'string', description: '子字段1' },
                    key2: { type: 'number', description: '子字段2' }
                  },
                  required: ['key1']
                },
                nested_map: {
                  type: 'object',
                  description: '嵌套Map类型示例',
                  properties: {
                    field1: {
                      type: 'object',
                      properties: {
                        subfield1: { type: 'string' },
                        subfield2: { type: 'number' }
                      }
                    },
                    field2: { type: 'string' }
                  }
                }
              }, null, 2)}
              rows={12}
            />
          </Form.Item>
          <Form.Item
            name={['parameters', 'required']}
            label="必需参数"
          >
            <Select mode="tags" placeholder="选择或输入必需的参数名" />
          </Form.Item>
          <Form.Item
            name="headers"
            label="请求头"
          >
            <Input.TextArea 
              placeholder={JSON.stringify({
                'Authorization': 'Bearer {API_KEY}',
                'Content-Type': 'application/json'
              }, null, 2)}
              rows={4}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingFunction ? '更新' : '添加'}
              </Button>
              <Button onClick={() => {
                setIsModalOpen(false);
                setEditingFunction(null);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {testingFunction && (
        <FunctionTestModal
          open={!!testingFunction}
          func={testingFunction}
          onClose={() => setTestingFunction(null)}
        />
      )}
    </div>
  );
} 