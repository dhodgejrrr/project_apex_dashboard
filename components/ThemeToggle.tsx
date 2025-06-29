import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../src/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        relative inline-flex items-center justify-center w-12 h-12 
        bg-card hover:bg-accent rounded-xl border border-border
        transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        group
      "
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        {/* Sun icon */}
        <Sun 
          className={`
            absolute inset-0 w-6 h-6 text-warning transition-all duration-300
            ${theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-75'
            }
          `}
        />
        
        {/* Moon icon */}
        <Moon 
          className={`
            absolute inset-0 w-6 h-6 text-info transition-all duration-300
            ${theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-75'
            }
          `}
        />
      </div>
      
      {/* Hover effect */}
      <div className="
        absolute inset-0 rounded-xl bg-gradient-to-r from-warning/10 to-info/10 
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
      " />
    </button>
  );
};

export default ThemeToggle;