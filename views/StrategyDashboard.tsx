import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import BarChartWrapper from '../components/charts/BarChartWrapper';
import CarCard from '../components/CarCard';
import { BarChart3, Timer, TrendingUp } from 'lucide-react';

const StrategyDashboard: React.FC = () => {
  const { raceData } = useData();
  const navigate = useNavigate();

  if (!raceData) return null;

  // Pit Cycle Loss Data
  const pitCycleData = raceData.full_pit_cycle_analysis
    .slice(0, 15)
    .map(analysis => ({
      car: `#${analysis.car_number}`,
      loss: analysis.average_cycle_loss,
      stops: analysis.number_of_stops_analyzed,
    }));

  // Longest Stints Data
  const longestStintsData = raceData.longest_stints_by_manufacturer.map(stint => ({
    manufacturer: stint.manufacturer,
    laps: stint.longest_green_stint_laps,
    car: `#${stint.stint_details.car_number}`,
  }));

  const handleCarClick = (carNumber: string) => {
    navigate(`/car/${carNumber}`);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-success-600 via-teal-600 to-success-700 rounded-3xl p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold font-racing">Strategy Analysis</h1>
              <p className="text-success-100 text-lg mt-2">Pit strategy, stint analysis, and race tactics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <BarChartWrapper
          data={pitCycleData}
          dataKey="loss"
          xAxisKey="car"
          title="Average Pit Cycle Loss"
          subtitle="Time lost during pit stop cycles (seconds)"
          color="#10b981"
          height={450}
          formatValue={(value) => `${value.toFixed(1)}s`}
        />

        <BarChartWrapper
          data={longestStintsData}
          dataKey="laps"
          xAxisKey="manufacturer"
          title="Longest Green Stint by Manufacturer"
          subtitle="Maximum consecutive green flag laps"
          color="#f59e0b"
          height={450}
          formatValue={(value) => `${value} laps`}
        />
      </div>

      {/* Enhanced Strategy Analysis Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-card-foreground font-racing">Enhanced Strategy Analysis</h2>
            <p className="text-muted-foreground">Comprehensive performance metrics and tire degradation analysis</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {raceData.enhanced_strategy_analysis.slice(0, 16).map((car) => (
            <CarCard
              key={car.car_number}
              car={car}
              onClick={() => handleCarClick(car.car_number)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrategyDashboard;