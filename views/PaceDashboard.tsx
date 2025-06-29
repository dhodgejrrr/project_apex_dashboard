import React from 'react';
import { useData } from '../contexts/DataContext';
import BarChartWrapper from '../components/charts/BarChartWrapper';

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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Pace Analysis</h1>
        <p className="text-blue-100">Comprehensive lap time and performance analysis</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <BarChartWrapper
          data={perfectLapData}
          dataKey="perfection"
          xAxisKey="car"
          title="Perfect Lap Performance (%)"
          color="#3b82f6"
          height={400}
          formatValue={(value) => `${value.toFixed(2)}%`}
        />

        <BarChartWrapper
          data={actualVsOptimalData}
          dataKey="gap"
          xAxisKey="car"
          title="Actual vs Optimal Gap (seconds)"
          color="#ef4444"
          height={400}
          formatValue={(value) => `+${value.toFixed(3)}s`}
        />
      </div>

      {/* Manufacturer Comparison Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Fastest by Manufacturer</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manufacturer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fastest Lap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Optimal Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {raceData.fastest_by_manufacturer.map((manufacturer, index) => (
                <tr key={manufacturer.manufacturer} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{manufacturer.manufacturer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-900">{manufacturer.fastest_lap.time}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{manufacturer.fastest_lap.driver_name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">#{manufacturer.fastest_lap.car_number}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-600">{manufacturer.optimal_lap_time}</span>
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