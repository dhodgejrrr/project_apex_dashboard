import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GroupedBarChartWrapperProps {
  data: any[];
  dataKeys: string[];
  xAxisKey: string;
  title: string;
  subtitle?: string;
  colors?: string[];
  height?: number;
  formatValue?: (value: any) => string;
}

const GroupedBarChartWrapper: React.FC<GroupedBarChartWrapperProps> = ({
  data,
  dataKeys,
  xAxisKey,
  title,
  subtitle,
  colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
  height = 400,
  formatValue = (value) => value?.toString() || '',
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-slate-600 text-base mt-2 font-medium">{subtitle}</p>
        )}
      </div>
      
      {/* Chart */}
      <div className="p-8">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#64748b"
              fontSize={14}
              fontFamily="Inter"
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={14}
              fontFamily="Inter"
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '16px',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'Inter',
                fontWeight: '500',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '12px 16px',
              }}
              formatter={(value, name) => [formatValue(value), name]}
              labelStyle={{ color: '#cbd5e1', fontWeight: '600' }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '24px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: '500'
              }}
            />
            {dataKeys.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                fill={colors[index % colors.length]}
                radius={[6, 6, 0, 0]}
                className="drop-shadow-sm"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GroupedBarChartWrapper;