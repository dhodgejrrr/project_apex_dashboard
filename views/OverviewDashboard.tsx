import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Trophy, Clock, Zap, Users, TrendingUp, Award, Target, Timer } from 'lucide-react';
import InsightsCard from '../components/InsightsCard';

const OverviewDashboard: React.FC = () => {
  const { raceData, hasInsightsData, hasSocialMediaData } = useData();
  const navigate = useNavigate();

  if (!raceData) return null;

  const stats = [
    {
      label: 'Total Cars',
      value: raceData.fastest_by_car_number.length,
      icon: Users,
      color: 'text-info',
      bgColor: 'bg-info/10',
      borderColor: 'border-info/20',
    },
    {
      label: 'Manufacturers',
      value: raceData.fastest_by_manufacturer.length,
      icon: Trophy,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
    },
    {
      label: 'Fastest Lap',
      value: raceData.fastest_by_manufacturer
        .reduce((fastest, mfg) => 
          mfg.fastest_lap.time < fastest ? mfg.fastest_lap.time : fastest, 
          '9:99.999'
        ),
      icon: Zap,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
    },
    {
      label: 'Perfect Laps',
      value: raceData.social_media_highlights.perfect_lap_ranking
        .filter(car => parseFloat(car.perfection_pct) === 100).length,
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-card via-card to-muted rounded-3xl p-12 text-card-foreground relative overflow-hidden border border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-primary/30">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-racing">Race Overview</h1>
              <p className="text-muted-foreground text-lg mt-2">Complete race analysis and performance insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`bg-card rounded-2xl shadow-lg border-2 ${stat.borderColor} p-8 group hover:shadow-xl transition-all duration-300 theme-transition`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-card-foreground font-mono">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Performance Leaders - Takes 2 columns */}
        <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fastest Lap Times */}
          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden theme-transition">
            <div className="px-8 py-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-card-foreground font-racing">Fastest Lap Times</h3>
              </div>
              <p className="text-muted-foreground text-sm mt-1">Top performers by absolute pace</p>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {raceData.fastest_by_car_number
                  .sort((a, b) => a.fastest_lap.time.localeCompare(b.fastest_lap.time))
                  .slice(0, 8)
                  .map((car, index) => (
                    <div key={car.car_number} className="flex items-center gap-6 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors duration-200 theme-transition">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' : 
                        'bg-gradient-to-br from-muted-foreground to-muted-foreground/80'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-card-foreground text-lg">#{car.car_number}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-card-foreground font-medium">{car.fastest_lap.driver_name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-xl text-card-foreground">{car.fastest_lap.time}</span>
                        <p className="text-muted-foreground text-sm">Lap {car.fastest_lap.lap_number}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Perfect Lap Rankings */}
          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden theme-transition">
            <div className="px-8 py-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-success" />
                <h3 className="text-xl font-bold text-card-foreground font-racing">Perfect Lap Rankings</h3>
              </div>
              <p className="text-muted-foreground text-sm mt-1">Closest to theoretical optimal</p>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {raceData.social_media_highlights.perfect_lap_ranking
                  .slice(0, 8)
                  .map((car, index) => (
                    <div key={car.car_number} className="flex items-center gap-6 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors duration-200 theme-transition">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                        index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' : 
                        'bg-gradient-to-br from-muted-foreground to-muted-foreground/80'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-card-foreground text-lg">#{car.car_number}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-card-foreground font-medium">{car.driver_name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-xl text-success">{car.perfection_pct}%</span>
                        <p className="text-muted-foreground text-sm font-mono">{car.fastest_lap_time}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Insights Card - Takes 1 column */}
        <div className="xl:col-span-1">
          {(hasInsightsData() || hasSocialMediaData()) ? (
            <InsightsCard onClick={() => navigate('/insights')} />
          ) : (
            <div className="bg-card rounded-2xl shadow-lg border border-border p-8 text-center theme-transition">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-card-foreground mb-2">Upload Insights</h3>
              <p className="text-muted-foreground text-sm">
                Upload insights and social media files to see strategic analysis and content recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;