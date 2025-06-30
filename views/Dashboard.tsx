import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import EnhancedFileUploader from '../components/EnhancedFileUploader';
import Navigation, { DashboardView } from '../components/Navigation';
import OverviewDashboard from './OverviewDashboard';
import PaceDashboard from './PaceDashboard';
import StrategyDashboard from './StrategyDashboard';
import DriverDashboard from './DriverDashboard';
import InsightsDashboard from './InsightsDashboard';
import AIAgentDashboard from './AIAgentDashboard';
import ThemeToggle from '../components/ThemeToggle';

const Dashboard: React.FC = () => {
  const { hasRaceData } = useData();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');

  const renderDashboardContent = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewDashboard onViewChange={setCurrentView} />;
      case 'pace':
        return <PaceDashboard />;
      case 'strategy':
        return <StrategyDashboard />;
      case 'driver':
        return <DriverDashboard />;
      case 'insights':
        return <InsightsDashboard />;
      case 'ai-agent':
        return <AIAgentDashboard />;
      default:
        return <OverviewDashboard onViewChange={setCurrentView} />;
    }
  };

  if (!hasRaceData()) {
    return (
      <div className="min-h-screen bg-background theme-transition relative">
        {/* Black circle asset in top right */}
        <div className="absolute top-4 right-4 z-10">
          <a 
            href="https://bolt.new/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:scale-105 transition-transform duration-300"
          >
            <img 
              src="/assets/black_circle_360x360.png" 
              alt="Black Circle Asset" 
              className="w-12 h-12 sm:w-16 sm:h-16 opacity-80 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            />
          </a>
        </div>
        
        <div className="container mx-auto px-4 sm:px-8 py-8 sm:py-16">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-16">
            <div className="flex items-center justify-center gap-4 mb-8 relative">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-2xl">
                <svg className="w-8 sm:w-10 h-8 sm:h-10 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              
              {/* Theme toggle positioned in top right */}
              <div className="absolute top-0 right-0">
                <ThemeToggle />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-card-foreground mb-4 sm:mb-6 tracking-tight">
              RaceLens
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium px-4">
              Upload your comprehensive race analysis to explore performance insights with professional-grade telemetry visualization
            </p>
          </div>

          {/* Enhanced File Upload Section */}
          <div className="max-w-6xl mx-auto">
            <EnhancedFileUploader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex theme-transition relative">
      {/* Black circle asset in top right */}
      <div className="absolute top-4 right-4 z-20">
        <a 
          href="https://bolt.new/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block hover:scale-105 transition-transform duration-300"
        >
          <img 
            src="/assets/black_circle_360x360.png" 
            alt="Black Circle Asset" 
            className="w-12 h-12 sm:w-16 sm:h-16 opacity-80 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          />
        </a>
      </div>

      {/* Sidebar Navigation */}
      <Navigation currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-0">
        <div className="p-4 sm:p-8 lg:p-12 pt-20 lg:pt-8">
          {renderDashboardContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;