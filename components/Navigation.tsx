import React from 'react';
import { BarChart3, Zap, Users, Trophy, TrendingUp } from 'lucide-react';

export type DashboardView = 'overview' | 'pace' | 'strategy' | 'driver';

interface NavigationProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'overview' as DashboardView, label: 'Race Overview', icon: Trophy, description: 'Key metrics & highlights' },
    { id: 'pace' as DashboardView, label: 'Pace Analysis', icon: Zap, description: 'Lap times & performance' },
    { id: 'strategy' as DashboardView, label: 'Strategy', icon: BarChart3, description: 'Pit stops & tactics' },
    { id: 'driver' as DashboardView, label: 'Driver Performance', icon: Users, description: 'Individual comparisons' },
  ];

  return (
    <nav className="bg-slate-900 border-r border-slate-800 min-h-screen w-80 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-8 border-b border-slate-800">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Race Analytics</h1>
            <p className="text-slate-400 text-sm font-medium">Professional Telemetry</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 p-6">
        <div className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full group relative overflow-hidden rounded-xl p-5 text-left transition-all duration-300 ease-out
                  ${isActive 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl transform scale-[1.02]' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70 hover:transform hover:scale-[1.01]'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300
                    ${isActive 
                      ? 'bg-white/20 shadow-inner' 
                      : 'bg-slate-800 group-hover:bg-slate-700'
                    }
                  `}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg tracking-tight">{item.label}</h3>
                    <p className={`text-sm mt-1 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-800">
        <div className="text-center">
          <p className="text-slate-500 text-sm font-medium">Powered by Advanced Telemetry</p>
          <p className="text-slate-600 text-xs mt-1">Real-time Race Intelligence</p>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;