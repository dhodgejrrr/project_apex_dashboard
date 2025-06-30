import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useOpenRouterChat } from '../src/hooks/useOpenRouterChat';
import { Bot, MessageSquare, Zap, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AIAgentDashboard: React.FC = () => {
  const { 
    hasRaceData, 
    raceDataString, 
    insightsDataString, 
    socialDataString 
  } = useData();
  
  const {
    messages,
    isLoading,
    error,
    isConversationStarted,
    startConversation,
    sendMessage,
    clearConversation
  } = useOpenRouterChat();

  const [inputMessage, setInputMessage] = React.useState('');

  // Initialize conversation when component mounts
  useEffect(() => {
    if (hasRaceData() && !isConversationStarted) {
      const dataContext = {
        race: raceDataString || undefined,
        insights: insightsDataString || undefined,
        social: socialDataString || undefined,
      };
      startConversation(dataContext);
    }
  }, [hasRaceData, isConversationStarted, raceDataString, insightsDataString, socialDataString, startConversation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      sendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
  };

  const suggestedQuestions = [
    "What was the fastest lap time in the race?",
    "Which car had the best pit stop performance?",
    "Summarize the key insights from this race",
    "Tell me about the BMW dominance mentioned in the insights",
    "What social media posts had the highest priority?",
    "Compare the tire degradation between different manufacturers",
    "Which driver showed the most consistency?",
    "Analyze the marketing angles for this race"
  ];

  if (!hasRaceData()) {
    return (
      <div className="space-y-8">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-card-foreground mb-4">AI Race Assistant</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Upload race data to start chatting with your AI assistant. Get insights, analysis, and answers about your race performance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            AI Race Assistant
          </h1>
          <p className="text-muted-foreground mt-2">
            Ask questions about your race data and get intelligent insights powered by OpenRouter AI
          </p>
        </div>
        
        {isConversationStarted && (
          <button
            onClick={clearConversation}
            className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-colors"
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Main Chat Container */}
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        {/* Chat Messages Area */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-card/50">
          {/* Loading State for Initial Connection */}
          {!isConversationStarted && isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Connecting to AI assistant...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Connection Error</p>
                <p className="text-sm text-destructive/80 mt-1">{error.message}</p>
              </div>
            </div>
          )}

          {/* Welcome Message and Suggested Questions */}
          {messages.length === 0 && !isLoading && !error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Hi! I'm your AI Race Assistant
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                I've analyzed your race data and I'm ready to answer questions about performance, strategy, and insights.
              </p>
              
              {/* Suggested Questions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-left p-4 bg-accent/50 hover:bg-accent/70 rounded-lg transition-colors border border-border/50 hover:border-border group"
                  >
                    <div className="flex items-start gap-3">
                      <Zap className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm text-card-foreground group-hover:text-primary transition-colors">
                        {question}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              
              <div className={`
                max-w-[80%] rounded-xl px-4 py-3 
                ${message.role === 'user' 
                  ? 'bg-primary text-primary-foreground ml-auto' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-medium text-accent-foreground">You</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && isConversationStarted && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-border bg-card">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your race data..."
              className="flex-1 px-4 py-3 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading || !isConversationStarted}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || !isConversationStarted}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAgentDashboard;
