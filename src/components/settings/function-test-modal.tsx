'use client';

import { useState } from 'react';
import { Modal, Form, Input, Button, Space, Typography, Spin } from 'antd';
import { FunctionDefinition } from '@/types';
import { testFunction, TestResult } from '@/lib/api/function-tester';
import { JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

const { Text } = Typography;

interface Props {
  open: boolean;
  func: FunctionDefinition;
  onClose: () => void;
}

interface FormData {
  [key: string]: any;
}

function renderNestedFormItems(
  paramName: string,
  paramDef: any,
  required: boolean = false,
  parentPath: string[] = []
) {
  const currentPath = [...parentPath, paramName];
  const fieldPath = currentPath.join('.');
  const isRequired = required || (paramDef.required || []).includes(paramName);

  if (paramDef.type === 'object' && paramDef.properties) {
    return (
      <div key={fieldPath} style={{ marginBottom: '1rem' }}>
        <Text strong>{paramName}</Text>
        <div style={{ marginLeft: '1.5rem' }}>
          {Object.entries(paramDef.properties).map(([key, prop]: [string, any]) => (
            renderNestedFormItems(key, prop, isRequired, currentPath)
          ))}
        </div>
      </div>
    );
  }

  const rules = [];
  if (isRequired) {
    rules.push({ required: true, message: `请输入 ${fieldPath}` });
  }

  switch (paramDef.type) {
    case 'number':
      return (
        <Form.Item
          key={fieldPath}
          name={fieldPath}
          label={paramName}
          rules={[
            ...rules,
            { pattern: /^-?\d*\.?\d*$/, message: `${fieldPath} 必须是数字` }
          ]}
          tooltip={paramDef.description}
        >
          <Input type="number" placeholder={`请输入${paramDef.description || paramName}`} />
        </Form.Item>
      );
    case 'boolean':
      return (
        <Form.Item
          key={fieldPath}
          name={fieldPath}
          label={paramName}
          rules={rules}
          tooltip={paramDef.description}
          valuePropName="checked"
        >
          <Input type="checkbox" />
        </Form.Item>
      );
    default:
      return (
        <Form.Item
          key={fieldPath}
          name={fieldPath}
          label={paramName}
          rules={rules}
          tooltip={paramDef.description}
        >
          <Input placeholder={`请输入${paramDef.description || paramName}`} />
        </Form.Item>
      );
  }
}

function processFormValues(values: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(values)) {
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = result;
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = current[parts[i]] || {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

export function FunctionTestModal({ open, func, onClose }: Props) {
  const [form] = Form.useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const handleTest = async (values: FormData) => {
    setLoading(true);
    try {
      // 处理表单值，将扁平的字段路径转换为嵌套对象
      const processedValues = processFormValues(values);
      const testResult = await testFunction(func, processedValues);
      setResult(testResult);
    } catch (error) {
      console.error('测试失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setResult(null);
    onClose();
  };

  return (
    <Modal
      title={`测试函数: ${func.name}`}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
    >
      <div className="mb-4">
        <Text type="secondary">{func.description}</Text>
      </div>

      <Form
        form={form}
        onFinish={handleTest}
        layout="vertical"
      >
        {Object.entries(func.parameters.properties).map(([key, value]: [string, any]) =>
          renderNestedFormItems(key, value, func.parameters.required?.includes(key))
        )}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              测试
            </Button>
            <Button onClick={handleClose}>
              关闭
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {result && (
        <div className="mt-4">
          <Text strong>测试结果：</Text>
          <div className="mt-2">
            <Text>耗时：{result.duration}ms</Text>
          </div>
          {result.success ? (
            <div className="mt-2 p-4 bg-gray-50 rounded">
              <JsonView data={result.data} style={defaultStyles} />
            </div>
          ) : (
            <div className="mt-2 p-4 bg-red-50 text-red-500 rounded">
              {result.error}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
} 