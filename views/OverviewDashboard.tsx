import React from 'react';
import { useData } from '../contexts/DataContext';
import { Trophy, Clock, Zap, Users, TrendingUp, Award, Target, Timer } from 'lucide-react';

const OverviewDashboard: React.FC = () => {
  const { raceData } = useData();

  if (!raceData) return null;

  const stats = [
    {
      label: 'Total Cars',
      value: raceData.fastest_by_car_number.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Manufacturers',
      value: raceData.fastest_by_manufacturer.length,
      icon: Trophy,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200',
    },
    {
      label: 'Fastest Lap',
      value: raceData.fastest_by_manufacturer
        .reduce((fastest, mfg) => 
          mfg.fastest_lap.time < fastest ? mfg.fastest_lap.time : fastest, 
          '9:99.999'
        ),
      icon: Zap,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200',
    },
    {
      label: 'Perfect Laps',
      value: raceData.social_media_highlights.perfect_lap_ranking
        .filter(car => parseFloat(car.perfection_pct) === 100).length,
      icon: Target,
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
      borderColor: 'border-accent-200',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-racing-900 via-racing-800 to-racing-900 rounded-3xl p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600/20 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-racing">Race Overview</h1>
              <p className="text-racing-300 text-lg mt-2">Complete race analysis and performance insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`bg-white rounded-2xl shadow-racing-lg border-2 ${stat.borderColor} p-8 group hover:shadow-racing-xl transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-racing-600 uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-racing-900 font-mono">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Leaders */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Fastest Lap Times */}
        <div className="bg-white rounded-2xl shadow-racing-lg border border-racing-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-racing-100 bg-gradient-to-r from-racing-50 to-white">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-accent-600" />
              <h3 className="text-xl font-bold text-racing-900 font-racing">Fastest Lap Times</h3>
            </div>
            <p className="text-racing-600 text-sm mt-1">Top performers by absolute pace</p>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              {raceData.fastest_by_car_number
                .sort((a, b) => a.fastest_lap.time.localeCompare(b.fastest_lap.time))
                .slice(0, 8)
                .map((car, index) => (
                  <div key={car.car_number} className="flex items-center gap-6 p-4 bg-racing-50 rounded-xl hover:bg-racing-100 transition-colors duration-200">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' : 
                      'bg-gradient-to-br from-racing-600 to-racing-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-racing-900 text-lg">#{car.car_number}</span>
                        <span className="text-racing-600">•</span>
                        <span className="text-racing-700 font-medium">{car.fastest_lap.driver_name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xl text-racing-900">{car.fastest_lap.time}</span>
                      <p className="text-racing-500 text-sm">Lap {car.fastest_lap.lap_number}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Perfect Lap Rankings */}
        <div className="bg-white rounded-2xl shadow-racing-lg border border-racing-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-racing-100 bg-gradient-to-r from-racing-50 to-white">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-success-600" />
              <h3 className="text-xl font-bold text-racing-900 font-racing">Perfect Lap Rankings</h3>
            </div>
            <p className="text-racing-600 text-sm mt-1">Closest to theoretical optimal</p>
          </div>
          <div className="p-8">
            <div className="space-y-4">
              {raceData.social_media_highlights.perfect_lap_ranking
                .slice(0, 8)
                .map((car, index) => (
                  <div key={car.car_number} className="flex items-center gap-6 p-4 bg-racing-50 rounded-xl hover:bg-racing-100 transition-colors duration-200">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' : 
                      'bg-gradient-to-br from-racing-600 to-racing-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-racing-900 text-lg">#{car.car_number}</span>
                        <span className="text-racing-600">•</span>
                        <span className="text-racing-700 font-medium">{car.driver_name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xl text-success-600">{car.perfection_pct}%</span>
                      <p className="text-racing-500 text-sm font-mono">{car.fastest_lap_time}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;