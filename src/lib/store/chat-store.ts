import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, ChatSettings } from '@/types';

interface ChatState {
  messages: Message[];
  settings: ChatSettings;
  isLoading: boolean;
  currentStreamingMessage: string | null;
  currentStreamingReasoningMessage: string | null;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  setLoading: (loading: boolean) => void;
  appendToLastMessage: (content: string) => void;
  setCurrentStreamingMessage: (content: string | null) => void;
  setCurrentStreamingReasoningMessage: (content: string | null) => void;
}

const defaultSettings: ChatSettings = {
  temperature: 0.7,
  topP: 0.9,
  topK: 50,
  maxLength: 2000,
  systemPrompt: '',
  model: 'chat',
  functions: []
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      settings: defaultSettings,
      isLoading: false,
      currentStreamingMessage: null,
      currentStreamingReasoningMessage: null,
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message],
        currentStreamingMessage: null,
        currentStreamingReasoningMessage: null
      })),
      clearMessages: () => set({ messages: [], currentStreamingMessage: null, currentStreamingReasoningMessage: null }),
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      setLoading: (loading) => set({ isLoading: loading }),
      appendToLastMessage: (content) => set((state) => {
        const messages = [...state.messages];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content += content;
        }
        return { messages };
      }),
      setCurrentStreamingMessage: (content) => set({ currentStreamingMessage: content }),
      setCurrentStreamingReasoningMessage: (content) => set({ currentStreamingReasoningMessage: content }),
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({ messages: state.messages, settings: state.settings }),
    }
  )
); 