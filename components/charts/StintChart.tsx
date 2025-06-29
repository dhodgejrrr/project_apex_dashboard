import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Flag } from 'lucide-react';
import { StintData, TireDegradationModel } from '../../types/race-data';

interface StintChartProps {
  stint: StintData;
  stintNumber: number;
  carNumber: string;
  tireDegradationModel: TireDegradationModel;
}

const StintChart: React.FC<StintChartProps> = ({ stint, stintNumber, carNumber, tireDegradationModel }) => {
  // Prepare chart data
  const chartData = stint.laps.map((lap, index) => {
    const lapInStint = lap.lap_in_stint;
    
    // Calculate tire degradation prediction using quadratic formula
    const { deg_coeff_a, deg_coeff_b, deg_coeff_c } = tireDegradationModel;
    const predictedTime = deg_coeff_a * (lapInStint * lapInStint) + deg_coeff_b * lapInStint + deg_coeff_c;
    
    return {
      lap: lapInStint,
      actualTime: lap.LAP_TIME_FUEL_CORRECTED_SEC,
      predictedTime: predictedTime,
      lapNumber: index + 1,
    };
  });

  const getStintTypeColor = () => {
    if (stint.green_laps > stint.yellow_laps && stint.green_laps > stint.red_laps) {
      return 'from-green-500 to-green-600';
    } else if (stint.yellow_laps > stint.red_laps) {
      return 'from-yellow-500 to-yellow-600';
    } else {
      return 'from-red-500 to-red-600';
    }
  };

  return (
    <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
      {/* Header */}
      <div className={`p-6 bg-gradient-to-r ${getStintTypeColor()} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flag className="h-6 w-6" />
            <div>
              <h3 className="text-xl font-black tracking-tight">Stint {stintNumber}</h3>
              <p className="text-white/80 font-medium">Laps {stint.lap_range}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black font-mono">{stint.total_laps}</p>
            <p className="text-white/80 text-sm font-medium">Total Laps</p>
          </div>
        </div>
      </div>

      {/* Stint Stats */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-green-600">{stint.green_laps}</p>
            <p className="text-sm font-bold text-muted-foreground">Green</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-yellow-600">{stint.yellow_laps}</p>
            <p className="text-sm font-bold text-muted-foreground">Yellow</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-red-600">{stint.red_laps}</p>
            <p className="text-sm font-bold text-muted-foreground">Red</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-card-foreground font-mono">{stint.best_green_time_formatted || 'N/A'}</p>
            <p className="text-sm font-bold text-muted-foreground">Best Time</p>
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
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `${value.toFixed(0)}s`}
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
              formatter={(value: any, name: string) => [
                `${value.toFixed(2)}s`, 
                name === 'actualTime' ? 'Actual Time' : 'Predicted Time'
              ]}
              labelFormatter={(label) => `Lap ${label} in Stint`}
              labelStyle={{ color: 'rgb(var(--color-muted-foreground))', fontWeight: '600' }}
            />
            <Line 
              type="monotone" 
              dataKey="actualTime" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="predictedTime" 
              stroke="rgb(var(--color-muted-foreground))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, stroke: 'rgb(var(--color-muted-foreground))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="flex items-center justify-center gap-6 mt-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-500"></div>
            <span className="text-muted-foreground">Actual Lap Times</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-muted-foreground border-dashed border-t-2"></div>
            <span className="text-muted-foreground">Tire Degradation Model</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StintChart;