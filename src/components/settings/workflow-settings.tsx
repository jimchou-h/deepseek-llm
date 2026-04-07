'use client';

import { useState } from 'react';
import { Form, Input, Button, Table, Space, Modal, message, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { useWorkflowStore } from '@/lib/store/workflow-store';
import type { Workflow } from '@/types/workflow';

export function WorkflowSettings() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow } = useWorkflowStore();

  const handleSubmit = async (values: any) => {
    try {
      if (editingWorkflow) {
        updateWorkflow(editingWorkflow.id, values);
        message.success('工作流更新成功');
      } else {
        addWorkflow(values);
        message.success('工作流添加成功');
      }
      setIsModalOpen(false);
      setEditingWorkflow(null);
      form.resetFields();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      deleteWorkflow(id);
      message.success('工作流删除成功');
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '工作流ID',
      dataIndex: 'workflow_id',
      key: 'workflow_id',
      render: (text: string) => (
        <Space>
          {text}
          <Tooltip title="复制ID">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(text);
                message.success('ID已复制');
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Workflow) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingWorkflow(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingWorkflow(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
        >
          添加工作流
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={workflows}
        rowKey="id"
      />

      <Modal
        title={editingWorkflow ? '编辑工作流' : '添加工作流'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingWorkflow(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入工作流名称' }]}
          >
            <Input placeholder="请输入工作流名称" />
          </Form.Item>

          <Form.Item
            label="工作流ID"
            name="workflow_id"
            rules={[{ required: true, message: '请输入工作流ID' }]}
          >
            <Input placeholder="请输入工作流ID" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea placeholder="请输入工作流描述" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingWorkflow(null);
                  form.resetFields();
                }}
              >
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 