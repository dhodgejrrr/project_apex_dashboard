import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartWrapperProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  title: string;
  subtitle?: string;
  color?: string;
  height?: number;
  formatValue?: (value: any) => string;
  yAxisDomain?: [number, number];
}

const BarChartWrapper: React.FC<BarChartWrapperProps> = ({
  data,
  dataKey,
  xAxisKey,
  title,
  subtitle,
  color = '#ef4444',
  height = 400,
  formatValue = (value) => value?.toString() || '',
  yAxisDomain,
}) => {
  return (
    <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
      {/* Header */}
      {title && (
        <div className="px-8 py-6 border-b border-border bg-gradient-to-r from-muted/50 to-card">
          <h3 className="text-2xl font-black text-card-foreground tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-muted-foreground text-base mt-2 font-medium">{subtitle}</p>
          )}
        </div>
      )}
      
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
              domain={yAxisDomain || ['dataMin', 'dataMax']}
              tickFormatter={formatValue}
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
              formatter={(value) => [formatValue(value), title || 'Value']}
              labelStyle={{ color: 'rgb(var(--color-muted-foreground))', fontWeight: '600' }}
            />
            <Bar 
              dataKey={dataKey} 
              fill={color}
              radius={[8, 8, 0, 0]}
              className="drop-shadow-sm"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartWrapper;