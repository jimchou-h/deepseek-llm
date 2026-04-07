'use client';

import { useState } from 'react';
import { Card, List, Button, Modal, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTemplateStore } from '@/lib/store/template-store';
import { TemplateForm } from '@/components/templates/template-form';
import { PageBreadcrumb } from '@/components/layout/breadcrumb';
import { Template } from '@/types/template';
import styles from '@/styles/layout/page-layout.module.css';

export default function TemplatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplateStore();

  const handleSubmit = (values: any) => {
    try {
      if (editingTemplate) {
        updateTemplate(editingTemplate.id, values);
        message.success('模板更新成功');
      } else {
        addTemplate(values);
        message.success('模板创建成功');
      }
      setIsModalOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      deleteTemplate(id);
      message.success('模板删除成功');
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1 className="text-2xl font-bold">提示词模板</h1>
        </div>
        <div className={styles.pageBody}>
          <div className="mb-4 flex justify-between items-center">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTemplate(null);
                setIsModalOpen(true);
              }}
            >
              新建模板
            </Button>
          </div>

          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={templates}
            renderItem={(template) => (
              <List.Item>
                <Card
                  title={template.title}
                  hoverable
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(template)}
                    >
                      编辑
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="确定要删除这个模板吗？"
                      onConfirm={() => handleDelete(template.id)}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={template.category}
                    description={template.description}
                  />
                  <div className="mt-2 truncate text-gray-500">
                    {template.prompt}
                  </div>
                </Card>
              </List.Item>
            )}
          />

          <Modal
            title={editingTemplate ? '编辑模板' : '新建模板'}
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingTemplate(null);
            }}
            footer={null}
            width={720}
          >
            <TemplateForm
              data={editingTemplate || undefined}

              onSubmit={handleSubmit}
              onCancel={() => {
                setIsModalOpen(false);
                setEditingTemplate(null);
              }}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
} 