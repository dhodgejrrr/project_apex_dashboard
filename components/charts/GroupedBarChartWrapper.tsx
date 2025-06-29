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
    <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border bg-gradient-to-r from-muted/50 to-card">
        <h3 className="text-2xl font-black text-card-foreground tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-muted-foreground text-base mt-2 font-medium">{subtitle}</p>
        )}
      </div>
      
      {/* Chart */}
      <div className="p-8 bg-card">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" strokeOpacity={0.5} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="rgb(var(--color-muted-foreground))"
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
              stroke="rgb(var(--color-muted-foreground))"
              fontSize={14}
              fontFamily="Inter"
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgb(var(--color-card))',
                border: '1px solid rgb(var(--color-border))',
                borderRadius: '16px',
                color: 'rgb(var(--color-card-foreground))',
                fontSize: '14px',
                fontFamily: 'Inter',
                fontWeight: '500',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '12px 16px',
              }}
              formatter={(value, name) => [formatValue(value), name]}
              labelStyle={{ color: 'rgb(var(--color-muted-foreground))', fontWeight: '600' }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '24px',
                fontFamily: 'Inter',
                fontSize: '14px',
                fontWeight: '500',
                color: 'rgb(var(--color-card-foreground))'
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