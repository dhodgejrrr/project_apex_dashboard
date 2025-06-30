import React from 'react';
import { MessageCircle, X } from 'lucide-react';

interface ChatToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const ChatToggleButton: React.FC<ChatToggleButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg
        flex items-center justify-center transition-all duration-300 ease-in-out
        ${isOpen 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }
        hover:scale-110 hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
      `}
      aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
    >
      {isOpen ? (
        <X size={24} />
      ) : (
        <MessageCircle size={24} />
      )}
    </button>
  );
};

export default ChatToggleButton;
