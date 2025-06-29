import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import EnhancedFileUploader from '../components/EnhancedFileUploader';
import Navigation, { DashboardView } from '../components/Navigation';
import OverviewDashboard from './OverviewDashboard';
import PaceDashboard from './PaceDashboard';
import StrategyDashboard from './StrategyDashboard';
import DriverDashboard from './DriverDashboard';
import InsightsDashboard from './InsightsDashboard';
import ThemeToggle from '../components/ThemeToggle';

const Dashboard: React.FC = () => {
  const { hasRaceData } = useData();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');

  const renderDashboardContent = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewDashboard />;
      case 'pace':
        return <PaceDashboard />;
      case 'strategy':
        return <StrategyDashboard />;
      case 'driver':
        return <DriverDashboard />;
      case 'insights':
        return <InsightsDashboard />;
      default:
        return <OverviewDashboard />;
    }
  };

  if (!hasRaceData()) {
    return (
      <div className="min-h-screen bg-background theme-transition">
        <div className="container mx-auto px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-8 relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              
              {/* Theme toggle positioned in top right */}
              <div className="absolute top-0 right-0">
                <ThemeToggle />
              </div>
            </div>
            <h1 className="text-6xl font-black text-card-foreground mb-6 tracking-tight">
              Race Data Analysis Dashboard
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
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
    <div className="min-h-screen bg-background flex theme-transition">
      {/* Sidebar Navigation */}
      <Navigation currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 lg:p-12">
          {renderDashboardContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;