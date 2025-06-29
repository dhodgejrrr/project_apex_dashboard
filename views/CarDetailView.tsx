import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Zap, Users, Gauge, TrendingUp, Timer, Fuel } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import StintChart from '../components/charts/StintChart';
import TireDegradationChart from '../components/charts/TireDegradationChart';
import SectorChart from '../components/charts/SectorChart';
import PitStopTimeline from '../components/PitStopTimeline';

const CarDetailView: React.FC = () => {
  const { carNumber } = useParams<{ carNumber: string }>();
  const navigate = useNavigate();
  const { raceData } = useData();

  if (!raceData || !carNumber) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center theme-transition">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">Car data not found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Find car data
  const carStrategy = raceData.race_strategy_by_car.find(car => car.car_number === carNumber);
  const carAnalysis = raceData.enhanced_strategy_analysis.find(car => car.car_number === carNumber);
  const carFastest = raceData.fastest_by_car_number.find(car => car.car_number === carNumber);

  if (!carStrategy || !carAnalysis || !carFastest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center theme-transition">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">Car #{carNumber} data not found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getManufacturerGradient = (manufacturer: string) => {
    const gradients: Record<string, string> = {
      'Mercedes-AMG': 'from-cyan-500 via-teal-500 to-cyan-600',
      'BMW': 'from-blue-500 via-blue-600 to-indigo-600',
      'Audi': 'from-red-500 via-red-600 to-red-700',
      'Porsche': 'from-yellow-500 via-orange-500 to-red-500',
      'Ford': 'from-blue-600 via-indigo-600 to-blue-700',
      'McLaren': 'from-orange-500 via-red-500 to-pink-600',
      'Aston Martin': 'from-green-500 via-emerald-600 to-green-700',
      'Honda': 'from-red-600 via-red-700 to-red-800',
      'Toyota': 'from-red-500 via-pink-500 to-red-600',
      'Hyundai': 'from-blue-500 via-purple-500 to-indigo-600',
      'Cupra': 'from-amber-500 via-orange-500 to-red-500',
    };
    return gradients[carAnalysis.manufacturer] || 'from-gray-500 via-gray-600 to-gray-700';
  };

  // Prepare sector data for the chart
  const prepareSectorData = () => {
    // For demonstration, we'll create sample sector data
    // In a real implementation, this would come from the race data
    const sampleData = [
      { lap: 1, s1: 35.123, s2: 42.567, s3: 38.146, total: 115.836 },
      { lap: 2, s1: 35.089, s2: 42.634, s3: 38.203, total: 115.926 },
      { lap: 3, s1: 35.156, s2: 42.512, s3: 38.089, total: 115.757 },
      { lap: 4, s1: 35.201, s2: 42.678, s3: 38.234, total: 116.113 },
      { lap: 5, s1: 35.067, s2: 42.489, s3: 38.067, total: 115.623 },
      { lap: 6, s1: 35.134, s2: 42.601, s3: 38.178, total: 115.913 },
      { lap: 7, s1: 35.098, s2: 42.534, s3: 38.123, total: 115.755 },
      { lap: 8, s1: 35.167, s2: 42.612, s3: 38.201, total: 115.980 },
    ];
    return sampleData;
  };

  return (
    <div className="min-h-screen bg-background theme-transition">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10 theme-transition">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-card-foreground hover:bg-accent rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-2xl font-black font-mono">{carNumber}</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <Gauge className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-card-foreground tracking-tight">Car #{carNumber} Analysis</h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-lg font-bold text-card-foreground">{carAnalysis.team}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-lg font-semibold text-muted-foreground">{carAnalysis.manufacturer}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Manufacturer Header */}
        <div className={`h-4 bg-gradient-to-r ${getManufacturerGradient(carAnalysis.manufacturer)} rounded-t-2xl mb-8`} />

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border theme-transition">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Avg Green Pace</span>
            </div>
            <p className="text-2xl font-black text-card-foreground font-mono">{carAnalysis.avg_green_pace_fuel_corrected}</p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border theme-transition">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Consistency</span>
            </div>
            <p className="text-2xl font-black text-card-foreground font-mono">{carAnalysis.race_pace_consistency_stdev.toFixed(3)}s</p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border theme-transition">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Avg Pit Time</span>
            </div>
            <p className="text-2xl font-black text-card-foreground font-mono">{carAnalysis.avg_pit_stationary_time}</p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border theme-transition">
            <div className="flex items-center gap-3 mb-3">
              <Timer className="h-5 w-5 text-red-500" />
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tire Deg Rate</span>
            </div>
            <p className="text-2xl font-black text-card-foreground font-mono">
              {carAnalysis.tire_degradation_model.end_of_stint_deg_rate_s_per_lap.toFixed(3)}s/lap
            </p>
          </div>
        </div>

        {/* Sector Analysis */}
        <div className="mb-12">
          <SectorChart
            data={prepareSectorData()}
            title="Sector Performance Analysis"
            subtitle="Lap-by-lap sector time breakdown with delta comparison"
            height={400}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Stint Analysis */}
          <div className="space-y-6">
            {carStrategy.stints.map((stint, index) => (
              <StintChart
                key={stint.stint_number}
                stint={stint}
                stintNumber={stint.stint_number}
                carNumber={carNumber}
                tireDegradationModel={carAnalysis.tire_degradation_model}
              />
            ))}
          </div>

          {/* Tire Degradation Model */}
          <div className="space-y-6">
            <TireDegradationChart
              tireDegradationModel={carAnalysis.tire_degradation_model}
              carNumber={carNumber}
            />
            
            {/* Pit Stop Timeline */}
            <PitStopTimeline
              pitStops={carStrategy.pit_stop_details}
              driverChanges={carStrategy.driver_change_details}
              carNumber={carNumber}
            />
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
          <div className="p-8 border-b border-border">
            <h3 className="text-2xl font-black text-card-foreground tracking-tight">Race Summary</h3>
            <p className="text-muted-foreground text-base mt-2 font-medium">Complete race statistics and performance data</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-card-foreground">Lap Times</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Fastest Lap:</span>
                    <span className="font-mono font-bold text-card-foreground">{carFastest.fastest_lap.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Optimal Lap:</span>
                    <span className="font-mono font-bold text-card-foreground">{carFastest.optimal_lap_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Best S1:</span>
                    <span className="font-mono font-bold text-card-foreground">{carFastest.best_s1.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Best S2:</span>
                    <span className="font-mono font-bold text-card-foreground">{carFastest.best_s2.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Best S3:</span>
                    <span className="font-mono font-bold text-card-foreground">{carFastest.best_s3.time}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-card-foreground">Pit Strategy</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Total Pit Stops:</span>
                    <span className="font-bold text-card-foreground">{carStrategy.total_pit_stops}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Total Pit Time:</span>
                    <span className="font-mono font-bold text-card-foreground">{carStrategy.total_pit_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Average Pit Time:</span>
                    <span className="font-mono font-bold text-card-foreground">{carStrategy.average_pit_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Driver Changes:</span>
                    <span className="font-bold text-card-foreground">{carStrategy.total_driver_changes}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-card-foreground">Tire Model</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Model Quality:</span>
                    <span className="font-bold text-green-600">{carAnalysis.tire_degradation_model.model_quality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Clean Laps Used:</span>
                    <span className="font-bold text-card-foreground">{carAnalysis.tire_degradation_model.total_clean_laps_used}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Predicted Loss (5 laps):</span>
                    <span className="font-mono font-bold text-red-600">{carAnalysis.tire_degradation_model.predicted_final_5_laps_loss_s.toFixed(2)}s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailView;