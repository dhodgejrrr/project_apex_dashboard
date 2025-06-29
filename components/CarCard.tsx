import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Zap, Users, TrendingUp, Timer, Gauge } from 'lucide-react';
import { EnhancedStrategyAnalysis } from '../types/race-data';

interface CarCardProps {
  car: EnhancedStrategyAnalysis;
  onClick?: () => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/car/${car.car_number}`);
    }
  };

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
    return gradients[manufacturer] || 'from-gray-500 via-gray-600 to-gray-700';
  };

  const getDegradationColor = (rate: number) => {
    const absRate = Math.abs(rate);
    if (absRate < 0.1) return 'text-green-600';
    if (absRate < 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDegradationWidth = (rate: number) => {
    return Math.min(Math.abs(rate) * 100, 100);
  };

  return (
    <div 
      className="group relative bg-card rounded-2xl shadow-xl border border-border overflow-hidden transform transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl cursor-pointer hover:border-primary/30 theme-transition"
      onClick={handleClick}
    >
      {/* Manufacturer Header */}
      <div className={`h-3 bg-gradient-to-r ${getManufacturerGradient(car.manufacturer)}`} />
      
      <div className="p-8">
        {/* Car Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-xl font-black font-mono">{car.car_number}</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <Gauge className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-card-foreground tracking-tight">{car.team}</h3>
              <p className="text-muted-foreground font-semibold">{car.manufacturer}</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Green Pace</span>
            </div>
            <p className="text-xl font-mono font-black text-card-foreground">{car.avg_green_pace_fuel_corrected}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Consistency</span>
            </div>
            <p className="text-xl font-mono font-black text-card-foreground">{car.race_pace_consistency_stdev.toFixed(3)}s</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Pit Time</span>
            </div>
            <p className="text-xl font-mono font-black text-card-foreground">{car.avg_pit_stationary_time}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tire Deg Rate</span>
            </div>
            <p className={`text-lg font-mono font-black ${getDegradationColor(car.tire_degradation_model.end_of_stint_deg_rate_s_per_lap)}`}>
              {car.tire_degradation_model.end_of_stint_deg_rate_s_per_lap.toFixed(3)}s/lap
            </p>
          </div>
        </div>

        {/* Tire Degradation Visualization */}
        <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-card-foreground">Tire Degradation Profile</span>
            <span className="text-xs text-muted-foreground bg-card px-3 py-1 rounded-full border font-medium">
              {car.tire_degradation_model.model_quality}
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                  car.tire_degradation_model.end_of_stint_deg_rate_s_per_lap < 0 
                    ? 'from-green-400 to-green-600' 
                    : 'from-yellow-400 via-orange-500 to-red-600'
                }`}
                style={{ 
                  width: `${getDegradationWidth(car.tire_degradation_model.end_of_stint_deg_rate_s_per_lap)}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
              <span>Excellent</span>
              <span>Poor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-500 pointer-events-none" />
    </div>
  );
};

export default CarCard;