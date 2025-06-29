import React from 'react';
import { useData } from '../contexts/DataContext';
import GroupedBarChartWrapper from '../components/charts/GroupedBarChartWrapper';
import BarChartWrapper from '../components/charts/BarChartWrapper';

const DriverDashboard: React.FC = () => {
  const { raceData } = useData();

  if (!raceData) return null;

  // Driver Delta Data (showing cars with multiple drivers)
  const driverDeltaData = raceData.driver_deltas_by_car
    .filter(car => car.deltas_to_fastest.length > 0)
    .slice(0, 10)
    .map(car => {
      const delta = car.deltas_to_fastest[0];
      return {
        car: `#${car.car_number}`,
        lapTime: parseFloat(delta.lap_time_delta),
        s1: parseFloat(delta.s1_delta),
        s2: parseFloat(delta.s2_delta),
        s3: parseFloat(delta.s3_delta),
      };
    });

  // Traffic Management Data
  const trafficData = raceData.traffic_management_analysis
    .slice(0, 15)
    .map(driver => ({
      driver: driver.driver_name.split(' ').pop(), // Last name only for space
      car: `#${driver.car_number}`,
      totalLaps: driver.total_traffic_laps,
      inClass: driver.in_class_traffic_laps,
      outOfClass: driver.out_of_class_traffic_laps,
    }));

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-3xl p-12 text-white">
        <h1 className="text-4xl font-black mb-3 tracking-tight">Driver Performance</h1>
        <p className="text-purple-100 text-xl font-medium">Individual driver analysis and comparisons</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <GroupedBarChartWrapper
          data={driverDeltaData}
          dataKeys={['lapTime', 's1', 's2', 's3']}
          xAxisKey="car"
          title="Driver Performance Deltas"
          subtitle="Performance gaps between teammates (seconds)"
          colors={['#ef4444', '#3b82f6', '#10b981', '#f59e0b']}
          height={450}
          formatValue={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(3)}s`}
        />

        <BarChartWrapper
          data={trafficData}
          dataKey="totalLaps"
          xAxisKey="driver"
          title="Traffic Management"
          subtitle="Total laps spent in traffic situations"
          color="#8b5cf6"
          height={450}
          formatValue={(value) => `${value} laps`}
        />
      </div>

      {/* Driver Performance Table */}
      <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
        <div className="p-8 border-b border-border">
          <h3 className="text-2xl font-black text-card-foreground tracking-tight">Driver Delta Analysis</h3>
          <p className="text-muted-foreground text-base mt-2 font-medium">Performance gaps between teammates</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Car #
                </th>
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Fastest Driver
                </th>
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Slower Driver
                </th>
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Lap Time Gap
                </th>
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  S1 Gap
                </th>
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  S2 Gap
                </th>
                <th className="px-8 py-4 text-left text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  S3 Gap
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {raceData.driver_deltas_by_car.slice(0, 15).map((car) => {
                const delta = car.deltas_to_fastest[0];
                if (!delta) return null;
                
                return (
                  <tr key={car.car_number} className="hover:bg-muted/30 transition-colors theme-transition">
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="text-base font-bold text-card-foreground">#{car.car_number}</span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="text-base text-card-foreground font-medium">{car.fastest_driver_name}</span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="text-base text-card-foreground font-medium">{delta.driver_name}</span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="text-base font-mono font-bold text-red-600">+{delta.lap_time_delta}s</span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`text-base font-mono font-bold ${parseFloat(delta.s1_delta) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {parseFloat(delta.s1_delta) >= 0 ? '+' : ''}{delta.s1_delta}s
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`text-base font-mono font-bold ${parseFloat(delta.s2_delta) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {parseFloat(delta.s2_delta) >= 0 ? '+' : ''}{delta.s2_delta}s
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`text-base font-mono font-bold ${parseFloat(delta.s3_delta) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {parseFloat(delta.s3_delta) >= 0 ? '+' : ''}{delta.s3_delta}s
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

export default DriverDashboard;