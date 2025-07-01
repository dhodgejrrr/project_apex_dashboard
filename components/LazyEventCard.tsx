/**
 * Lazy-loaded Event Card Component - Phase 4 Performance Optimization
 * 
 * A performance-optimized event card that loads content only when visible
 * and uses intersection observer for efficient rendering.
 */

import React, { memo, useState, useCallback } from 'react';
import { 
  ChevronDown, ChevronUp, Flag, Trophy, AlertCircle, 
  ArrowRightLeft, Zap, Timer, Activity, Clock 
} from 'lucide-react';
import { useIntersectionObserver } from '../utils/performance-optimizations';
import { TimelineEvent } from '../types/race-data';

interface LazyEventCardProps {
  event: TimelineEvent;
  index: number;
  totalEvents: number;
  isExpanded: boolean;
  onToggleExpansion: (eventId: string) => void;
  eventGrouping: 'chronological' | 'by_type';
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'race_start':
      return <Flag className="h-5 w-5" />;
    case 'race_end':
      return <Trophy className="h-5 w-5" />;
    case 'pit_stop':
      return <AlertCircle className="h-5 w-5" />;
    case 'driver_change':
      return <ArrowRightLeft className="h-5 w-5" />;
    case 'fastest_lap':
      return <Zap className="h-5 w-5" />;
    case 'fastest_sector':
      return <Timer className="h-5 w-5" />;
    case 'anomalous_lap':
      return <Activity className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'race_start':
      return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    case 'race_end':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'pit_stop':
      return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
    case 'driver_change':
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
    case 'fastest_lap':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    case 'fastest_sector':
      return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'anomalous_lap':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
  }
};

const getEventTypeLabel = (type: string) => {
  switch (type) {
    case 'race_start':
      return 'Race Start';
    case 'race_end':
      return 'Race End';
    case 'pit_stop':
      return 'Pit Stop';
    case 'driver_change':
      return 'Driver Change';
    case 'fastest_lap':
      return 'Fastest Lap';
    case 'fastest_sector':
      return 'Fastest Sector';
    case 'anomalous_lap':
      return 'Anomalous Lap';
    default:
      return 'Event';
  }
};

const formatEventDetails = (event: TimelineEvent) => {
  const details = event.details || {};
  const detailItems: { label: string; value: string; type?: 'normal' | 'highlight' | 'warning' }[] = [];

  switch (event.type) {
    case 'race_start':
      if (details.gridPosition) {
        detailItems.push({ 
          label: 'Grid Position', 
          value: `P${details.gridPosition}`,
          type: 'highlight'
        });
      }
      if (details.stintId) {
        detailItems.push({ label: 'Starting Stint', value: details.stintId });
      }
      break;

    case 'pit_stop':
      if (details.stationaryTime) {
        detailItems.push({ 
          label: 'Stationary Time', 
          value: details.stationaryTime,
          type: 'highlight'
        });
      }
      if (details.entryTime && details.exitTime) {
        detailItems.push({ label: 'Entry Time', value: details.entryTime });
        detailItems.push({ label: 'Exit Time', value: details.exitTime });
      }
      if (details.driverChange) {
        detailItems.push({ 
          label: 'Driver Change', 
          value: 'Yes',
          type: 'highlight'
        });
      }
      if (details.tireCompoundIn && details.tireCompoundOut) {
        detailItems.push({ 
          label: 'Tire Strategy', 
          value: `${details.tireCompoundIn} → ${details.tireCompoundOut}`
        });
      } else if (details.tireChange) {
        detailItems.push({ label: 'Tire Change', value: details.tireChange });
      }
      if (details.fuelAdded) {
        detailItems.push({ label: 'Fuel Added', value: `${details.fuelAdded}L` });
      }
      if (details.duration) {
        detailItems.push({ label: 'Total Duration', value: details.duration });
      }
      if (details.workPerformed && Array.isArray(details.workPerformed)) {
        detailItems.push({ 
          label: 'Work Performed', 
          value: details.workPerformed.join(', ')
        });
      }
      break;
    
    case 'driver_change':
      if (details.fromDriver && details.toDriver) {
        detailItems.push({ 
          label: 'Driver Change', 
          value: `${details.fromDriver} → ${details.toDriver}`,
          type: 'highlight'
        });
      }
      if (details.reason) {
        detailItems.push({ 
          label: 'Reason', 
          value: details.reason.charAt(0).toUpperCase() + details.reason.slice(1)
        });
      }
      if (details.timeInCarMinutes) {
        detailItems.push({ 
          label: 'Previous Driver Time', 
          value: `${details.timeInCarMinutes} minutes`
        });
      }
      if (details.pitStopNumber) {
        detailItems.push({ label: 'During Pit Stop', value: `#${details.pitStopNumber}` });
      }
      break;
    
    case 'fastest_lap':
      if (details.stintId) {
        detailItems.push({ label: 'Stint', value: details.stintId });
      }
      if (details.lapInStint) {
        detailItems.push({ label: 'Lap in Stint', value: details.lapInStint.toString() });
      }
      if (details.optimalTime) {
        detailItems.push({ 
          label: 'Optimal Time', 
          value: details.optimalTime,
          type: 'highlight'
        });
      }
      if (details.bestS1) {
        detailItems.push({ label: 'Sector 1', value: details.bestS1.time || details.bestS1 });
      }
      if (details.bestS2) {
        detailItems.push({ label: 'Sector 2', value: details.bestS2.time || details.bestS2 });
      }
      if (details.bestS3) {
        detailItems.push({ label: 'Sector 3', value: details.bestS3.time || details.bestS3 });
      }
      if (details.rank) {
        detailItems.push({ 
          label: 'Overall Rank', 
          value: `#${details.rank}`,
          type: 'highlight'
        });
      }
      break;
    
    case 'fastest_sector':
      if (details.sector) {
        detailItems.push({ 
          label: 'Sector', 
          value: `S${details.sector}`,
          type: 'highlight'
        });
      }
      if (details.sectorTime) {
        detailItems.push({ 
          label: 'Time', 
          value: details.sectorTime,
          type: 'highlight'
        });
      }
      if (details.stintId) {
        detailItems.push({ label: 'Stint', value: details.stintId });
      }
      break;
    
    case 'anomalous_lap':
      if (details.deviationPercentage) {
        detailItems.push({ 
          label: 'Deviation', 
          value: `+${details.deviationPercentage}%`,
          type: 'warning'
        });
      }
      if (details.medianTime) {
        detailItems.push({ label: 'Expected Time', value: details.medianTime });
      }
      if (details.suspectedCause) {
        const causes = {
          'traffic': 'Traffic Interference',
          'mistake': 'Driver Mistake',
          'pace_drop': 'Pace Drop',
          'overtaken': 'Overtaking Maneuver',
          'unknown': 'Unknown Cause'
        };
        detailItems.push({ 
          label: 'Suspected Cause', 
          value: causes[details.suspectedCause] || details.suspectedCause.replace('_', ' ').toUpperCase(),
          type: 'warning'
        });
      }
      if (details.stintNumber) {
        detailItems.push({ label: 'Stint', value: `#${details.stintNumber}` });
      }
      if (details.lapInStint) {
        detailItems.push({ label: 'Lap in Stint', value: details.lapInStint.toString() });
      }
      break;
  }

  return detailItems;
};

const LazyEventCard: React.FC<LazyEventCardProps> = memo(({
  event,
  index,
  totalEvents,
  isExpanded,
  onToggleExpansion,
  eventGrouping
}) => {
  const [ref, isVisible] = useIntersectionObserver(0.1, '100px');
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  // Once visible, stay loaded for better UX
  React.useEffect(() => {
    if (isVisible && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [isVisible, hasBeenVisible]);

  const handleToggle = useCallback(() => {
    onToggleExpansion(event.id);
  }, [event.id, onToggleExpansion]);

  if (!hasBeenVisible) {
    return (
      <div ref={ref} className="h-32 bg-card border border-border rounded-xl animate-pulse">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-muted rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-6 bg-muted rounded w-48 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const eventDetails = formatEventDetails(event);
  const hasDetails = eventDetails.length > 0;

  return (
    <div ref={ref}>
      {/* Type Group Header for by_type grouping */}
      {eventGrouping === 'by_type' && event.isFirstInType && (
        <div className="mb-3 px-4 py-2 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {getEventIcon(event.type)}
            <h4 className="text-sm font-semibold text-card-foreground">
              {getEventTypeLabel(event.type)}
            </h4>
            <span className="text-xs text-muted-foreground">
              ({event.typeEventCount} event{event.typeEventCount !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
      )}
      
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        <div 
          className={`p-6 ${hasDetails ? 'cursor-pointer' : ''}`}
          onClick={hasDetails ? handleToggle : undefined}
        >
          <div className="flex items-start gap-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)}
              </div>
              {index < totalEvents - 1 && (
                <div className="w-0.5 h-8 bg-border mt-2" />
              )}
            </div>

            {/* Event Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                      LAP {event.lap}
                    </span>
                    {eventGrouping === 'chronological' && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {getEventTypeLabel(event.type)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    {event.description}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>👤 {event.driver}</span>
                    <span>⏱️ {event.time}</span>
                    {event.team && <span>🏁 {event.team}</span>}
                  </div>
                </div>

                {hasDetails && (
                  <button className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {hasDetails && isExpanded && (
          <div className="px-6 pb-6 border-t border-border bg-muted/30">
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eventDetails.map((detail, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    {detail.label}:
                  </span>
                  <span className={`text-sm font-semibold ${
                    detail.type === 'highlight' ? 'text-primary' :
                    detail.type === 'warning' ? 'text-orange-600' :
                    'text-card-foreground'
                  }`}>
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

LazyEventCard.displayName = 'LazyEventCard';

export default LazyEventCard;
