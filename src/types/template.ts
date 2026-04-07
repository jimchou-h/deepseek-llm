export interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'general' | 'code' | 'writing' | 'analysis';
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type CreateTemplateInput = Omit<Template, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTemplateInput = Partial<CreateTemplateInput>; 