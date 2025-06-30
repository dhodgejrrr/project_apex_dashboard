import React from 'react';
import { useData } from '../contexts/DataContext';
import BarChartWrapper from '../components/charts/BarChartWrapper';
import { Zap, TrendingUp } from 'lucide-react';

const PaceDashboard: React.FC = () => {
  const { raceData } = useData();

  if (!raceData) return null;

  // Perfect Lap Performance Data with dynamic minimum
  const perfectLapRawData = raceData.social_media_highlights.perfect_lap_ranking
    .slice(0, 15)
    .map(car => ({
      car: `#${car.car_number}`,
      perfection: parseFloat(car.perfection_pct),
      driver: car.driver_name,
    }));

  // Calculate dynamic minimum for perfect lap chart (0.5 below lowest value)
  const minPerfection = Math.min(...perfectLapRawData.map(d => d.perfection));
  const dynamicMin = Math.max(0, minPerfection - 0.5);

  // Actual vs Optimal Lap Time Data with filtering for erroneous values
  const actualVsOptimalRawData = raceData.fastest_by_car_number
    .map(car => {
      // Parse time strings more carefully
      const parseTime = (timeStr: string): number => {
        if (timeStr.includes(':')) {
          const [minutes, seconds] = timeStr.split(':');
          return parseFloat(minutes) * 60 + parseFloat(seconds);
        }
        return parseFloat(timeStr);
      };

      const actualTime = parseTime(car.fastest_lap.time);
      const optimalTime = parseTime(car.optimal_lap_time);
      const gap = actualTime - optimalTime;
      const gapPercentage = (gap / optimalTime) * 100;

      return {
        car: `#${car.car_number}`,
        actual: actualTime,
        optimal: optimalTime,
        gap: gap,
        gapPercentage: gapPercentage,
        driver: car.fastest_lap.driver_name,
      };
    })
    .filter(car => {
      // Filter out erroneous values
      // Remove cars with negative gaps (impossible) or gaps > 30% (likely data errors)
      return car.gap >= 0 && car.gapPercentage <= 30 && car.gap <= 50; // 50 second max gap
    })
    .sort((a, b) => a.gap - b.gap) // Sort by gap ascending
    .slice(0, 15); // Take top 15

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
        <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
          {/* Custom Perfect Lap Chart with Dynamic Scaling */}
          <div className="px-8 py-6 border-b border-border bg-gradient-to-r from-muted/50 to-card">
            <h3 className="text-2xl font-black text-card-foreground tracking-tight">Perfect Lap Performance (%)</h3>
            <p className="text-muted-foreground text-base mt-2 font-medium">
              How close drivers came to their theoretical optimal lap
            </p>
          </div>
          
          <div className="p-8 bg-card">
            <div className="h-[450px]">
              <BarChartWrapper
                data={perfectLapRawData}
                dataKey="perfection"
                xAxisKey="car"
                title=""
                color="#3b82f6"
                height={450}
                formatValue={(value) => `${value.toFixed(2)}%`}
                yAxisDomain={[dynamicMin, 100]}
              />
            </div>
            <div className="mt-4 p-4 bg-muted/30 rounded-xl">
              <p className="text-sm text-muted-foreground font-medium">
                <strong>Chart Range:</strong> {dynamicMin.toFixed(1)}% - 100% (minimum set to 0.5% below lowest value for better visualization)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
          {/* Custom Actual vs Optimal Chart with Filtering */}
          <div className="px-8 py-6 border-b border-border bg-gradient-to-r from-muted/50 to-card">
            <h3 className="text-2xl font-black text-card-foreground tracking-tight">Actual vs Optimal Gap</h3>
            <p className="text-muted-foreground text-base mt-2 font-medium">
              Time difference between fastest and optimal lap (filtered for relevance)
            </p>
          </div>
          
          <div className="p-8 bg-card">
            <div className="h-[450px]">
              <BarChartWrapper
                data={actualVsOptimalRawData}
                dataKey="gap"
                xAxisKey="car"
                title=""
                color="#ef4444"
                height={450}
                formatValue={(value) => `+${value.toFixed(3)}s`}
              />
            </div>
            <div className="mt-4 p-4 bg-muted/30 rounded-xl">
              <p className="text-sm text-muted-foreground font-medium">
                <strong>Filtered Data:</strong> Showing cars with gaps ≤30% and ≤50s (excludes erroneous values like broken cars)
              </p>
              {raceData.fastest_by_car_number.length > actualVsOptimalRawData.length && (
                <p className="text-sm text-warning mt-1">
                  {raceData.fastest_by_car_number.length - actualVsOptimalRawData.length} cars filtered out due to erroneous data
                </p>
              )}
            </div>
          </div>
        </div>
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
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Gap to Optimal
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {raceData.fastest_by_manufacturer.map((manufacturer) => {
                // Calculate gap to optimal for this manufacturer
                const parseTime = (timeStr: string): number => {
                  if (timeStr.includes(':')) {
                    const [minutes, seconds] = timeStr.split(':');
                    return parseFloat(minutes) * 60 + parseFloat(seconds);
                  }
                  return parseFloat(timeStr);
                };

                const actualTime = parseTime(manufacturer.fastest_lap.time);
                const optimalTime = parseTime(manufacturer.optimal_lap_time);
                const gap = actualTime - optimalTime;

                return (
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
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`text-base font-mono font-bold ${gap > 2 ? 'text-red-600' : gap > 1 ? 'text-yellow-600' : 'text-green-600'}`}>
                        +{gap.toFixed(3)}s
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaceDashboard;