export interface FunctionParameter {
  type: string;
  description?: string;
  enum?: string[];
}

export interface FunctionDefinition {
  id: string;
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, FunctionParameter>;
    required: string[];
  };
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
}

export interface Settings {
  model: string;
  temperature: number;
  systemPrompt: string;
  functions: FunctionDefinition[];
} 