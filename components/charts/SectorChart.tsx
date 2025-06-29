import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ToggleLeft, ToggleRight, BarChart3, Layers } from 'lucide-react';

interface SectorData {
  lap: number;
  s1: number;
  s2: number;
  s3: number;
  total: number;
}

interface SectorChartProps {
  data: SectorData[];
  title: string;
  subtitle?: string;
  height?: number;
}

const SectorChart: React.FC<SectorChartProps> = ({
  data,
  title,
  subtitle,
  height = 400,
}) => {
  const [isStacked, setIsStacked] = useState(false);

  // Calculate deltas for regular view (relative to fastest lap)
  const fastestLap = data.reduce((fastest, lap) => 
    lap.total < fastest.total ? lap : fastest, data[0]
  );

  const deltaData = data.map(lap => ({
    lap: lap.lap,
    s1Delta: lap.s1 - fastestLap.s1,
    s2Delta: lap.s2 - fastestLap.s2,
    s3Delta: lap.s3 - fastestLap.s3,
    totalDelta: lap.total - fastestLap.total,
    s1: lap.s1,
    s2: lap.s2,
    s3: lap.s3,
    total: lap.total,
  }));

  const formatTime = (value: number) => {
    if (isStacked) {
      return `${value.toFixed(3)}s`;
    } else {
      return `${value >= 0 ? '+' : ''}${value.toFixed(3)}s`;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-4 shadow-xl">
          <p className="font-bold text-card-foreground mb-2">Lap {label}</p>
          {isStacked ? (
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm text-card-foreground">S1: {payload[0]?.value?.toFixed(3)}s</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-card-foreground">S2: {payload[1]?.value?.toFixed(3)}s</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span className="text-sm text-card-foreground">S3: {payload[2]?.value?.toFixed(3)}s</span>
                </div>
                <div className="border-t border-border pt-1 mt-2">
                  <span className="text-sm font-bold text-card-foreground">
                    Total: {(payload[0]?.value + payload[1]?.value + payload[2]?.value).toFixed(3)}s
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm text-card-foreground">
                    S1: {payload.find((p: any) => p.dataKey === 's1Delta')?.value >= 0 ? '+' : ''}
                    {payload.find((p: any) => p.dataKey === 's1Delta')?.value?.toFixed(3)}s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-card-foreground">
                    S2: {payload.find((p: any) => p.dataKey === 's2Delta')?.value >= 0 ? '+' : ''}
                    {payload.find((p: any) => p.dataKey === 's2Delta')?.value?.toFixed(3)}s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span className="text-sm text-card-foreground">
                    S3: {payload.find((p: any) => p.dataKey === 's3Delta')?.value >= 0 ? '+' : ''}
                    {payload.find((p: any) => p.dataKey === 's3Delta')?.value?.toFixed(3)}s
                  </span>
                </div>
                <div className="border-t border-border pt-1 mt-2">
                  <span className="text-sm font-bold text-card-foreground">
                    Total Delta: {payload.find((p: any) => p.dataKey === 'totalDelta')?.value >= 0 ? '+' : ''}
                    {payload.find((p: any) => p.dataKey === 'totalDelta')?.value?.toFixed(3)}s
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden theme-transition">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border bg-gradient-to-r from-muted/50 to-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-card-foreground tracking-tight">{title}</h3>
            {subtitle && (
              <p className="text-muted-foreground text-base mt-2 font-medium">{subtitle}</p>
            )}
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>Delta View</span>
            </div>
            <button
              onClick={() => setIsStacked(!isStacked)}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-accent transition-colors"
              title={isStacked ? 'Switch to Delta View' : 'Switch to Stacked View'}
            >
              {isStacked ? (
                <ToggleRight className="h-6 w-6 text-primary" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Stacked View</span>
              <Layers className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-8 bg-card">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={deltaData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" strokeOpacity={0.5} />
            <XAxis 
              dataKey="lap" 
              stroke="rgb(var(--color-muted-foreground))"
              fontSize={14}
              fontFamily="Inter"
              fontWeight={500}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="rgb(var(--color-muted-foreground))"
              fontSize={14}
              fontFamily="Inter"
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              width={80}
              tickFormatter={formatTime}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {isStacked ? (
              // Stacked view - shows actual sector times
              <>
                <Bar 
                  dataKey="s1" 
                  stackId="sectors"
                  fill="#3b82f6"
                  radius={[0, 0, 0, 0]}
                  name="Sector 1"
                />
                <Bar 
                  dataKey="s2" 
                  stackId="sectors"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                  name="Sector 2"
                />
                <Bar 
                  dataKey="s3" 
                  stackId="sectors"
                  fill="#f97316"
                  radius={[8, 8, 0, 0]}
                  name="Sector 3"
                />
              </>
            ) : (
              // Delta view - shows time differences from fastest
              <>
                <Bar 
                  dataKey="s1Delta" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="S1 Delta"
                />
                <Bar 
                  dataKey="s2Delta" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="S2 Delta"
                />
                <Bar 
                  dataKey="s3Delta" 
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                  name="S3 Delta"
                />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-blue-500 rounded-sm"></div>
            <span className="text-muted-foreground">Sector 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-green-500 rounded-sm"></div>
            <span className="text-muted-foreground">Sector 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-orange-500 rounded-sm"></div>
            <span className="text-muted-foreground">Sector 3</span>
          </div>
        </div>
        
        {/* View Description */}
        <div className="mt-4 p-4 bg-muted/30 rounded-xl">
          <p className="text-sm text-muted-foreground font-medium">
            {isStacked ? (
              <><strong>Stacked View:</strong> Shows actual sector times stacked to visualize total lap time composition. Taller bars indicate slower laps.</>
            ) : (
              <><strong>Delta View:</strong> Shows time difference from the fastest lap for each sector. Positive values indicate slower times, negative values indicate faster times.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SectorChart;