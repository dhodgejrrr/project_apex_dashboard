import { useState, useCallback } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatError {
  message: string;
  code?: string;
}

interface DataContext {
  race?: string;
  insights?: string;
  social?: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: ChatError | null;
  isConversationStarted: boolean;
  startConversation: (dataContext: DataContext) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  clearConversation: () => void;
}

/**
 * Generate a comprehensive system prompt for the OpenRouter AI assistant
 */
const generateSystemPrompt = (data: DataContext): string => {
  const sections = [];
  
  sections.push(`You are RaceSight AI, a helpful motorsport data analyst and assistant.

Your goal is to answer questions based ONLY on the race data provided below. You have access to detailed race telemetry, insights, and social media data.

IMPORTANT INSTRUCTIONS:
- Only use the data provided below to answer questions
- If you don't know the answer from the provided data, say so clearly
- Be concise but thorough in your analysis
- When referencing specific data points, be precise (e.g., lap times, car numbers, driver names)
- You can perform calculations and comparisons using the provided data
- Format your responses clearly with bullet points or structured text when appropriate

`);

  if (data.race) {
    sections.push(`--- RACE DATA START ---
\`\`\`json
${data.race}
\`\`\`
--- RACE DATA END ---

`);
  }

  if (data.insights) {
    sections.push(`--- INSIGHTS DATA START ---
\`\`\`json
${data.insights}
\`\`\`
--- INSIGHTS DATA END ---

`);
  }

  if (data.social) {
    sections.push(`--- SOCIAL MEDIA DATA START ---
\`\`\`json
${data.social}
\`\`\`
--- SOCIAL MEDIA DATA END ---

`);
  }

  sections.push(`Now you're ready to answer questions about this race data. Be helpful and accurate!`);

  return sections.join('\n');
};

export const useTavus = (): UseTavusReturn => {
  const [messages, setMessages] = useState<TavusMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TavusError | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isConversationStarted, setIsConversationStarted] = useState(false);

  const API_KEY = import.meta.env.VITE_TAVUS_API_KEY;
  const API_URL = import.meta.env.VITE_TAVUS_API_URL || 'https://api.tavus.ai/v1';

  const startConversation = useCallback(async (dataContext: DataContext) => {
    if (!API_KEY) {
      setError({ message: 'Tavus API key not configured. Please add VITE_TAVUS_API_KEY to your .env.local file.' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const systemPrompt = generateSystemPrompt(dataContext);
      
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          context: systemPrompt,
          model: 'tavus-1', // Default model, adjust as needed
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start conversation: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setConversationId(data.conversation_id);
      setIsConversationStarted(true);
      
      // Add welcome message
      const welcomeMessage: TavusMessage = {
        role: 'assistant',
        content: "Hi! I'm your AI Race Assistant. I've analyzed your race data and I'm ready to answer questions about lap times, strategy, insights, and more. What would you like to know?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);

      console.log('Tavus conversation started successfully:', data.conversation_id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError({ message: `Failed to connect to AI assistant: ${errorMessage}` });
      console.error('Failed to start Tavus conversation:', err);
    } finally {
      setIsLoading(false);
    }
  }, [API_KEY, API_URL]);

  const sendMessage = useCallback(async (message: string) => {
    if (!conversationId) {
      setError({ message: 'No active conversation. Please try restarting the chat.' });
      return;
    }

    if (!API_KEY) {
      setError({ message: 'Tavus API key not configured' });
      return;
    }

    // Add user message immediately
    const userMessage: TavusMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev: TavusMessage[]) => [...prev, userMessage]);

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI assistant error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add assistant response
      const assistantMessage: TavusMessage = {
        role: 'assistant',
        content: data.response || data.message || 'I apologize, but I didn\'t receive a proper response. Please try asking your question again.',
        timestamp: new Date(),
      };
      setMessages((prev: TavusMessage[]) => [...prev, assistantMessage]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError({ message: errorMessage });
      console.error('Failed to send message to Tavus:', err);
      
      // Add error message to chat
      const errorChatMessage: TavusMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
      };
      setMessages((prev: TavusMessage[]) => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, API_KEY, API_URL]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setIsConversationStarted(false);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    isConversationStarted,
    startConversation,
    sendMessage,
    clearConversation,
  };
};
