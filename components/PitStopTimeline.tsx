import React from 'react';
import { Clock, Users, Wrench, ArrowRight } from 'lucide-react';
import { PitStopDetail, DriverChangeDetail } from '../types/race-data';

interface PitStopTimelineProps {
  pitStops: PitStopDetail[];
  driverChanges: DriverChangeDetail[];
  carNumber: string;
}

const PitStopTimeline: React.FC<PitStopTimelineProps> = ({ pitStops, driverChanges, carNumber }) => {
  // Combine pit stops and driver changes into timeline events
  const timelineEvents = [
    ...pitStops.map(stop => ({
      type: 'pitstop' as const,
      lap: stop.lap_number_entry,
      data: stop,
    })),
    ...driverChanges.map(change => ({
      type: 'driverchange' as const,
      lap: change.lap_number,
      data: change,
    })),
  ].sort((a, b) => a.lap - b.lap);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6" />
          <div>
            <h3 className="text-xl font-black tracking-tight">Pit Stop Timeline</h3>
            <p className="text-white/80 font-medium">Race strategy execution</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900">{pitStops.length}</p>
            <p className="text-sm font-bold text-slate-600">Total Pit Stops</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900">{driverChanges.length}</p>
            <p className="text-sm font-bold text-slate-600">Driver Changes</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        {timelineEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 font-medium">No pit stops or driver changes recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={`${event.type}-${event.lap}-${index}`} className="relative">
                {/* Timeline line */}
                {index < timelineEvents.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-slate-200"></div>
                )}
                
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${event.type === 'pitstop' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-green-100 text-green-600'
                    }
                  `}>
                    {event.type === 'pitstop' ? (
                      <Wrench className="h-6 w-6" />
                    ) : (
                      <Users className="h-6 w-6" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {event.type === 'pitstop' ? (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-slate-900">
                            Pit Stop #{(event.data as PitStopDetail).stop_number}
                          </h4>
                          <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            Lap {event.lap}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600 font-medium">Total Time:</span>
                            <span className="ml-2 font-mono font-bold text-slate-900">
                              {(event.data as PitStopDetail).total_pit_lane_time}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600 font-medium">Stationary:</span>
                            <span className="ml-2 font-mono font-bold text-slate-900">
                              {(event.data as PitStopDetail).stationary_time}
                            </span>
                          </div>
                        </div>
                        {(event.data as PitStopDetail).driver_change && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-green-600" />
                            <span className="text-green-700 font-medium">Driver change included</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-bold text-slate-900">Driver Change</h4>
                          <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            Lap {event.lap}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-medium text-slate-900">
                            {(event.data as DriverChangeDetail).from_driver}
                          </span>
                          <ArrowRight className="h-4 w-4 text-slate-500" />
                          <span className="font-medium text-slate-900">
                            {(event.data as DriverChangeDetail).to_driver}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PitStopTimeline;