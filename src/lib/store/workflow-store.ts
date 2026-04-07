import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Workflow } from '@/types/workflow';

interface WorkflowState {
  workflows: Workflow[];
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>) => void;
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set) => ({
      workflows: [],
      addWorkflow: (workflow) => set((state) => ({
        workflows: [...state.workflows, {
          ...workflow,
          id: uuidv4(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }],
      })),
      updateWorkflow: (id, workflow) => set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === id
            ? { ...w, ...workflow, updated_at: new Date().toISOString() }
            : w
        ),
      })),
      deleteWorkflow: (id) => set((state) => ({
        workflows: state.workflows.filter((w) => w.id !== id),
      })),
    }),
    {
      name: 'workflow-storage',
    }
  )
); 