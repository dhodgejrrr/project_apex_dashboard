import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Zap, Users, Gauge, TrendingUp, Timer, Fuel } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import StintChart from '../components/charts/StintChart';
import TireDegradationChart from '../components/charts/TireDegradationChart';
import PitStopTimeline from '../components/PitStopTimeline';

const CarDetailView: React.FC = () => {
  const { carNumber } = useParams<{ carNumber: string }>();
  const navigate = useNavigate();
  const { raceData } = useData();

  if (!raceData || !carNumber) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Car data not found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Car #{carNumber} data not found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Car #{carNumber} Analysis</h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-lg font-bold text-slate-700">{carAnalysis.team}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-lg font-semibold text-slate-600">{carAnalysis.manufacturer}</span>
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
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Avg Green Pace</span>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{carAnalysis.avg_green_pace_fuel_corrected}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Consistency</span>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{carAnalysis.race_pace_consistency_stdev.toFixed(3)}s</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Avg Pit Time</span>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">{carAnalysis.avg_pit_stationary_time}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <Timer className="h-5 w-5 text-red-500" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Tire Deg Rate</span>
            </div>
            <p className="text-2xl font-black text-slate-900 font-mono">
              {carAnalysis.tire_degradation_model.end_of_stint_deg_rate_s_per_lap.toFixed(3)}s/lap
            </p>
          </div>
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
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Race Summary</h3>
            <p className="text-slate-600 text-base mt-2 font-medium">Complete race statistics and performance data</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900">Lap Times</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Fastest Lap:</span>
                    <span className="font-mono font-bold text-slate-900">{carFastest.fastest_lap.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Optimal Lap:</span>
                    <span className="font-mono font-bold text-slate-900">{carFastest.optimal_lap_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Best S1:</span>
                    <span className="font-mono font-bold text-slate-900">{carFastest.best_s1.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Best S2:</span>
                    <span className="font-mono font-bold text-slate-900">{carFastest.best_s2.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Best S3:</span>
                    <span className="font-mono font-bold text-slate-900">{carFastest.best_s3.time}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900">Pit Strategy</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Total Pit Stops:</span>
                    <span className="font-bold text-slate-900">{carStrategy.total_pit_stops}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Total Pit Time:</span>
                    <span className="font-mono font-bold text-slate-900">{carStrategy.total_pit_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Average Pit Time:</span>
                    <span className="font-mono font-bold text-slate-900">{carStrategy.average_pit_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Driver Changes:</span>
                    <span className="font-bold text-slate-900">{carStrategy.total_driver_changes}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900">Tire Model</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Model Quality:</span>
                    <span className="font-bold text-green-600">{carAnalysis.tire_degradation_model.model_quality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Clean Laps Used:</span>
                    <span className="font-bold text-slate-900">{carAnalysis.tire_degradation_model.total_clean_laps_used}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Predicted Loss (5 laps):</span>
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