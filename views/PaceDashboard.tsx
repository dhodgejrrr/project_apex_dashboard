import React from 'react';
import { useData } from '../contexts/DataContext';
import BarChartWrapper from '../components/charts/BarChartWrapper';
import { Zap, TrendingUp } from 'lucide-react';

const PaceDashboard: React.FC = () => {
  const { raceData } = useData();

  if (!raceData) return null;

  // Perfect Lap Performance Data
  const perfectLapData = raceData.social_media_highlights.perfect_lap_ranking
    .slice(0, 15)
    .map(car => ({
      car: `#${car.car_number}`,
      perfection: parseFloat(car.perfection_pct),
      driver: car.driver_name,
    }));

  // Actual vs Optimal Lap Time Data
  const actualVsOptimalData = raceData.fastest_by_car_number
    .slice(0, 15)
    .map(car => {
      const actualTime = parseFloat(car.fastest_lap.time.replace(':', '')) * 60;
      const optimalTime = parseFloat(car.optimal_lap_time.replace(':', '')) * 60;
      return {
        car: `#${car.car_number}`,
        actual: actualTime,
        optimal: optimalTime,
        gap: actualTime - optimalTime,
      };
    });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-3xl p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-racing">Pace Analysis</h1>
              <p className="text-blue-100 text-lg mt-2">Comprehensive lap time and performance analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <BarChartWrapper
          data={perfectLapData}
          dataKey="perfection"
          xAxisKey="car"
          title="Perfect Lap Performance (%)"
          subtitle="How close drivers came to their theoretical optimal lap"
          color="#3b82f6"
          height={450}
          formatValue={(value) => `${value.toFixed(2)}%`}
        />

        <BarChartWrapper
          data={actualVsOptimalData}
          dataKey="gap"
          xAxisKey="car"
          title="Actual vs Optimal Gap"
          subtitle="Time difference between fastest and optimal lap (seconds)"
          color="#ef4444"
          height={450}
          formatValue={(value) => `+${value.toFixed(3)}s`}
        />
      </div>

      {/* Manufacturer Comparison Table */}
      <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
        <div className="p-8 border-b border-border bg-gradient-to-r from-muted/50 to-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-card-foreground tracking-tight">Fastest by Manufacturer</h3>
              <p className="text-muted-foreground text-base mt-1 font-medium">Best performance from each manufacturer</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Manufacturer
                </th>
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Fastest Lap
                </th>
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Car #
                </th>
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Optimal Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {raceData.fastest_by_manufacturer.map((manufacturer, index) => (
                <tr key={manufacturer.manufacturer} className="hover:bg-muted/30 transition-colors theme-transition">
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-3" />
                      <span className="text-base font-bold text-card-foreground">{manufacturer.manufacturer}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <span className="text-base font-mono font-bold text-card-foreground">{manufacturer.fastest_lap.time}</span>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <span className="text-base text-card-foreground font-medium">{manufacturer.fastest_lap.driver_name}</span>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <span className="text-base font-bold text-primary">#{manufacturer.fastest_lap.car_number}</span>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <span className="text-base font-mono text-muted-foreground">{manufacturer.optimal_lap_time}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaceDashboard;