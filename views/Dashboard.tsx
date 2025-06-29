import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import FileUploader from '../components/FileUploader';
import Navigation, { DashboardView } from '../components/Navigation';
import OverviewDashboard from './OverviewDashboard';
import PaceDashboard from './PaceDashboard';
import StrategyDashboard from './StrategyDashboard';
import DriverDashboard from './DriverDashboard';

const Dashboard: React.FC = () => {
  const { raceData } = useData();
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
      default:
        return <OverviewDashboard />;
    }
  };

  if (!raceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
            </div>
            <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tight">
              Race Data Analysis Dashboard
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Upload your comprehensive race analysis to explore performance insights with professional-grade telemetry visualization
            </p>
          </div>

          {/* File Upload Section */}
          <div className="max-w-4xl mx-auto">
            <FileUploader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
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