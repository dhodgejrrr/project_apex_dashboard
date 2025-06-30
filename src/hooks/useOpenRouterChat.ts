import { useState, useCallback } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
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

interface UseOpenRouterChatReturn {
  /** Array of chat messages in chronological order */
  messages: ChatMessage[];
  /** Whether the AI is currently processing a request */
  isLoading: boolean;
  /** Current error state, if any */
  error: ChatError | null;
  /** Whether a conversation has been started with data context */
  isConversationStarted: boolean;
  /** Initialize a new conversation with race data context */
  startConversation: (dataContext: DataContext) => Promise<void>;
  /** Send a message to the AI and get a response */
  sendMessage: (message: string) => Promise<void>;
  /** Clear the current conversation and reset state */
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
- Use markdown formatting for better readability

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

/**
 * Custom hook for managing OpenRouter AI chat conversations
 * 
 * This hook provides a complete chat interface for interacting with race data
 * using OpenRouter's AI models. It handles conversation state, API calls,
 * error handling, and message formatting.
 * 
 * @returns {UseOpenRouterChatReturn} Object containing chat state and methods
 */
export const useOpenRouterChat = (): UseOpenRouterChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string>('');

  const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
  const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  // You can change this to other available models:
  // 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'google/gemini-pro', etc.
  const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free';

  const startConversation = useCallback(async (dataContext: DataContext) => {
    if (!API_KEY) {
      setError({ message: 'OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your .env.local file.' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = generateSystemPrompt(dataContext);
      setSystemPrompt(prompt);
      setIsConversationStarted(true);
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: "Hi! I'm your AI Race Assistant. I've analyzed your race data and I'm ready to answer questions about lap times, strategy, insights, and more. What would you like to know?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);

      console.log('OpenRouter chat initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError({ message: `Failed to initialize AI assistant: ${errorMessage}` });
      console.error('Failed to initialize OpenRouter chat:', err);
    } finally {
      setIsLoading(false);
    }
  }, [API_KEY]);

  const sendMessage = useCallback(async (message: string) => {
    if (!isConversationStarted) {
      setError({ message: 'No active conversation. Please try restarting the chat.' });
      return;
    }

    if (!API_KEY) {
      setError({ message: 'OpenRouter API key not configured' });
      return;
    }

    // Add user message immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev: ChatMessage[]) => [...prev, userMessage]);

    setIsLoading(true);
    setError(null);

    try {
      // Prepare messages for OpenRouter API
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.filter(msg => msg.role !== 'system').map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'RaceSight AI Dashboard',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        let errorMessage = `AI assistant error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage += ` - ${errorData.error.message}`;
          }
        } catch {
          // If we can't parse error JSON, use the default message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from AI assistant');
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.choices[0].message.content || 'I apologize, but I didn\'t receive a proper response. Please try asking your question again.',
        timestamp: new Date(),
      };
      setMessages((prev: ChatMessage[]) => [...prev, assistantMessage]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError({ message: errorMessage });
      console.error('Failed to send message to OpenRouter:', err);
      
      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
      };
      setMessages((prev: ChatMessage[]) => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isConversationStarted, API_KEY, systemPrompt, messages, MODEL]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setIsConversationStarted(false);
    setError(null);
    setIsLoading(false);
    setSystemPrompt('');
  }, []);

  return {
    messages,
    isLoading,
    error,
    isConversationStarted,
    startConversation,
    sendMessage,
    clearConversation,
  };
};
