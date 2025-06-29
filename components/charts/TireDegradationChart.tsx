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
      default: return 'text-muted-foreground';
    }
  };

  const getQualityBg = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'excellent': return 'from-green-500 to-green-600';
      case 'good': return 'from-blue-500 to-blue-600';
      case 'fair': return 'from-yellow-500 to-yellow-600';
      case 'poor': return 'from-red-500 to-red-600';
      default: return 'from-muted-foreground to-muted-foreground/80';
    }
  };

  return (
    <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
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
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xl font-black text-card-foreground font-mono">
              {tireDegradationModel.end_of_stint_deg_rate_s_per_lap.toFixed(3)}s
            </p>
            <p className="text-sm font-bold text-muted-foreground">Deg Rate/Lap</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-card-foreground">
              {tireDegradationModel.total_clean_laps_used}
            </p>
            <p className="text-sm font-bold text-muted-foreground">Clean Laps</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-red-600 font-mono">
              {tireDegradationModel.predicted_final_5_laps_loss_s.toFixed(2)}s
            </p>
            <p className="text-sm font-bold text-muted-foreground">5-Lap Loss</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 bg-card">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" strokeOpacity={0.5} />
            <XAxis 
              dataKey="lap" 
              stroke="rgb(var(--color-muted-foreground))"
              fontSize={12}
              fontFamily="Inter"
              fontWeight={500}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="rgb(var(--color-muted-foreground))"
              fontSize={12}
              fontFamily="Inter"
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `+${value.toFixed(1)}s`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgb(var(--color-card))',
                border: '1px solid rgb(var(--color-border))',
                borderRadius: '12px',
                color: 'rgb(var(--color-card-foreground))',
                fontSize: '14px',
                fontFamily: 'Inter',
                fontWeight: '500',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                padding: '12px 16px',
              }}
              formatter={(value: any) => [`+${value.toFixed(3)}s`, 'Cumulative Degradation']}
              labelFormatter={(label) => `Lap ${label}`}
              labelStyle={{ color: 'rgb(var(--color-muted-foreground))', fontWeight: '600' }}
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
        
        <div className="mt-4 p-4 bg-muted/30 rounded-xl">
          <p className="text-sm text-muted-foreground font-medium">
            <strong>Model Formula:</strong> Time = {tireDegradationModel.deg_coeff_a.toFixed(6)}x² + {tireDegradationModel.deg_coeff_b.toFixed(6)}x + {tireDegradationModel.deg_coeff_c.toFixed(3)}
          </p>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            <strong>Fastest Lap Predicted At:</strong> Lap {tireDegradationModel.fastest_lap_of_stint_predicted_at.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TireDegradationChart;