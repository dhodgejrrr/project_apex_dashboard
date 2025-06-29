import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Award } from 'lucide-react';
import { TireDegradationModel } from '../../types/race-data';

interface TireDegradationChartProps {
  tireDegradationModel: TireDegradationModel;
  carNumber: string;
}

const TireDegradationChart: React.FC<TireDegradationChartProps> = ({ tireDegradationModel, carNumber }) => {
  // Generate degradation curve data
  const generateDegradationData = () => {
    const data = [];
    const { deg_coeff_a, deg_coeff_b, deg_coeff_c } = tireDegradationModel;
    
    for (let lap = 1; lap <= 30; lap++) {
      const predictedTime = deg_coeff_a * (lap * lap) + deg_coeff_b * lap + deg_coeff_c;
      const baseTime = deg_coeff_c; // Time at lap 0
      const degradation = predictedTime - baseTime;
      
      data.push({
        lap,
        predictedTime,
        degradation,
        cumulativeLoss: degradation,
      });
    }
    
    return data;
  };

  const chartData = generateDegradationData();
  
  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getQualityBg = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'excellent': return 'from-green-500 to-green-600';
      case 'good': return 'from-blue-500 to-blue-600';
      case 'fair': return 'from-yellow-500 to-yellow-600';
      case 'poor': return 'from-red-500 to-red-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className={`p-6 bg-gradient-to-r ${getQualityBg(tireDegradationModel.model_quality)} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-6 w-6" />
            <div>
              <h3 className="text-xl font-black tracking-tight">Tire Degradation Model</h3>
              <p className="text-white/80 font-medium">Predictive performance analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span className="text-lg font-black">{tireDegradationModel.model_quality}</span>
            </div>
            <p className="text-white/80 text-sm font-medium">Model Quality</p>
          </div>
        </div>
      </div>

      {/* Model Stats */}
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xl font-black text-slate-900 font-mono">
              {tireDegradationModel.end_of_stint_deg_rate_s_per_lap.toFixed(3)}s
            </p>
            <p className="text-sm font-bold text-slate-600">Deg Rate/Lap</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-slate-900">
              {tireDegradationModel.total_clean_laps_used}
            </p>
            <p className="text-sm font-bold text-slate-600">Clean Laps</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-red-600 font-mono">
              {tireDegradationModel.predicted_final_5_laps_loss_s.toFixed(2)}s
            </p>
            <p className="text-sm font-bold text-slate-600">5-Lap Loss</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis 
              dataKey="lap" 
              stroke="#64748b"
              fontSize={12}
              fontFamily="Inter"
              fontWeight={500}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              fontFamily="Inter"
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `+${value.toFixed(1)}s`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'Inter',
                fontWeight: '500',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                padding: '12px 16px',
              }}
              formatter={(value: any) => [`+${value.toFixed(3)}s`, 'Cumulative Degradation']}
              labelFormatter={(label) => `Lap ${label}`}
              labelStyle={{ color: '#cbd5e1', fontWeight: '600' }}
            />
            <Line 
              type="monotone" 
              dataKey="cumulativeLoss" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 p-4 bg-slate-50 rounded-xl">
          <p className="text-sm text-slate-600 font-medium">
            <strong>Model Formula:</strong> Time = {tireDegradationModel.deg_coeff_a.toFixed(6)}x² + {tireDegradationModel.deg_coeff_b.toFixed(6)}x + {tireDegradationModel.deg_coeff_c.toFixed(3)}
          </p>
          <p className="text-sm text-slate-600 font-medium mt-1">
            <strong>Fastest Lap Predicted At:</strong> Lap {tireDegradationModel.fastest_lap_of_stint_predicted_at.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TireDegradationChart;