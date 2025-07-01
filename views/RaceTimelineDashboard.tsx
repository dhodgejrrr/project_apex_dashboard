import React, { useState, useMemo, useCallback, Suspense } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  Clock, Flag, Zap, AlertCircle, Trophy, Car, Users, 
  ArrowRightLeft, Timer, Gauge, Activity, ChevronDown, ChevronUp,
  Loader2, AlertTriangle, RefreshCw, Info
} from 'lucide-react';
import CarSelectorDropdown from '../components/CarSelectorDropdown';
import { 
  extractAllEventsForCar, 
  extractRaceStartEvents,
  extractPitStopEvents,
  extractDriverChangeEvents,
  extractFastestLapEvents,
  extractFastestSectorEvents,
  extractAnomalousLapEvents,
  validateRaceData,
  getAvailableCars 
} from '../utils/timeline-event-extractor';
import { 
  validateRaceDataStructure, 
  checkFeatureAvailability,
  detectEdgeCases,
  getCarInfoSafely,
  validateEventData
} from '../utils/data-validation';
import { 
  useEnhancedMemo,
  useDebouncedState,
  useIntersectionObserver,
  usePerformanceMonitor
} from '../utils/performance-optimizations';
import { TimelineEvent } from '../types/race-data';

const RaceTimelineDashboard: React.FC = () => {
  const { raceData } = useData();
  
  // Phase 4: Performance monitoring
  const renderCount = usePerformanceMonitor('RaceTimelineDashboard');
  
  // Phase 4: Debounced state for better performance
  const [immediateCarNumber, debouncedCarNumber, setCarNumber] = useDebouncedState<string | null>(null);
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(new Set());
  
  // Phase 3: Configuration options for anomalous lap detection
  const [anomalousLapThreshold, setAnomalousLapThreshold] = useState(5); // Default 5%
  const [showAnomalousLaps, setShowAnomalousLaps] = useState(true);
  const [eventGrouping, setEventGrouping] = useState<'chronological' | 'by_type'>('chronological');

  // Phase 4: Enhanced state management
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use debounced value as the selected car number
  const selectedCarNumber = debouncedCarNumber;

  // Phase 4: Enhanced car selection with debouncing
  const handleCarSelection = useCallback((carNumber: string | null) => {
    setCarNumber(carNumber);
    setProcessingError(null);
  }, [setCarNumber]);

  // Validate data and get available features - Phase 4: Enhanced memoization
  const dataValidation = useEnhancedMemo(() => {
    try {
      if (!raceData) return null;
      return validateRaceDataStructure(raceData);
    } catch (error) {
      console.error('Data validation error:', error);
      setProcessingError('Failed to validate race data structure');
      return null;
    }
  }, [raceData], { maxCacheSize: 5, expirationMs: 600000 });

  const availableFeatures = useEnhancedMemo(() => {
    try {
      if (!raceData) return null;
      return checkFeatureAvailability(raceData);
    } catch (error) {
      console.error('Feature availability check error:', error);
      return null;
    }
  }, [raceData], { maxCacheSize: 5, expirationMs: 600000 });

  // Phase 4: Edge case detection with caching
  const edgeCases = useEnhancedMemo(() => {
    try {
      if (!raceData) return null;
      return detectEdgeCases(raceData);
    } catch (error) {
      console.error('Edge case detection error:', error);
      return null;
    }
  }, [raceData], { maxCacheSize: 5, expirationMs: 600000 });

  // Get timeline events for selected car - Phase 3 Enhanced + Phase 4 Error Handling
  const timelineEvents = useMemo(() => {
    if (!raceData || !selectedCarNumber || isProcessing) return [];
    
    try {
      setIsProcessing(true);
      setProcessingError(null);

      // Phase 4: Validate car exists before processing
      const carInfo = getCarInfoSafely(raceData, selectedCarNumber);
      if (!carInfo) {
        throw new Error(`Car ${selectedCarNumber} not found in race data`);
      }

      // Gather all event types using Phase 1 extraction functions with error handling
      const allEvents: TimelineEvent[] = [];

      try {
        const raceStartEvents = extractRaceStartEvents(raceData).filter(e => e.carNumber === selectedCarNumber);
        allEvents.push(...raceStartEvents);
      } catch (error) {
        console.warn('Error extracting race start events:', error);
      }

      try {
        const pitStopEvents = extractPitStopEvents(raceData).filter(e => e.carNumber === selectedCarNumber);
        allEvents.push(...pitStopEvents);
      } catch (error) {
        console.warn('Error extracting pit stop events:', error);
      }

      try {
        const driverChangeEvents = extractDriverChangeEvents(raceData).filter(e => e.carNumber === selectedCarNumber);
        allEvents.push(...driverChangeEvents);
      } catch (error) {
        console.warn('Error extracting driver change events:', error);
      }

      try {
        const fastestLapEvents = extractFastestLapEvents(raceData).filter(e => e.carNumber === selectedCarNumber);
        allEvents.push(...fastestLapEvents);
      } catch (error) {
        console.warn('Error extracting fastest lap events:', error);
      }

      try {
        const fastestSectorEvents = extractFastestSectorEvents(raceData).filter(e => e.carNumber === selectedCarNumber);
        allEvents.push(...fastestSectorEvents);
      } catch (error) {
        console.warn('Error extracting fastest sector events:', error);
      }

      try {
        if (showAnomalousLaps) {
          const anomalousLapEvents = extractAnomalousLapEvents(raceData, anomalousLapThreshold).filter(e => e.carNumber === selectedCarNumber);
          allEvents.push(...anomalousLapEvents);
        }
      } catch (error) {
        console.warn('Error extracting anomalous lap events:', error);
      }

      // Sort and handle multiple events per lap
      let sortedEvents = allEvents.sort((a, b) => {
        // Primary sort: lap number
        if (a.lap !== b.lap) return a.lap - b.lap;
        
        // Secondary sort: event priority for same lap
        const eventPriority = {
          'race_start': 1,
          'pit_stop': 2,
          'driver_change': 3,
          'fastest_lap': 4,
          'fastest_sector': 5,
          'anomalous_lap': 6
        };
        
        return (eventPriority[a.type] || 99) - (eventPriority[b.type] || 99);
      });

      // Apply grouping based on user preference
      if (eventGrouping === 'by_type') {
        sortedEvents = allEvents.sort((a, b) => {
          // Primary sort: event type
          const eventPriority = {
            'race_start': 1,
            'pit_stop': 2,
            'driver_change': 3,
            'fastest_lap': 4,
            'fastest_sector': 5,
            'anomalous_lap': 6
          };
          
          const typeDiff = (eventPriority[a.type] || 99) - (eventPriority[b.type] || 99);
          if (typeDiff !== 0) return typeDiff;
          
          // Secondary sort: lap number within same type
          return a.lap - b.lap;
        });
      }

      // Group by lap if needed and add lap markers for multiple events
      const processedEvents = sortedEvents.map((event, index) => {
        const prevEvent = sortedEvents[index - 1];
        const nextEvent = sortedEvents[index + 1];
        
        // Add grouping information for UI
        return {
          ...event,
          isFirstInLap: !prevEvent || prevEvent.lap !== event.lap,
          isLastInLap: !nextEvent || nextEvent.lap !== event.lap,
          lapEventCount: sortedEvents.filter(e => e.lap === event.lap).length,
          isFirstInType: eventGrouping === 'by_type' && (!prevEvent || prevEvent.type !== event.type),
          isLastInType: eventGrouping === 'by_type' && (!nextEvent || nextEvent.type !== event.type),
          typeEventCount: eventGrouping === 'by_type' ? sortedEvents.filter(e => e.type === event.type).length : 0
        };
      });

      return processedEvents;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error processing timeline events';
      console.error('Timeline processing error:', error);
      setProcessingError(errorMessage);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [raceData, selectedCarNumber, anomalousLapThreshold, showAnomalousLaps, eventGrouping, isProcessing]);

  // Get selected car info
  const selectedCarInfo = useMemo(() => {
    if (!raceData || !selectedCarNumber) return null;
    const cars = getAvailableCars(raceData);
    return cars.find(car => car.number === selectedCarNumber) || null;
  }, [raceData, selectedCarNumber]);

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Phase 4: Retry mechanism for failed operations
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setProcessingError(null);
    setIsProcessing(false);
    // Force re-computation of timeline events by triggering the dependency
    if (selectedCarNumber) {
      setCarNumber(selectedCarNumber);
    }
  }, [selectedCarNumber, setCarNumber]);

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
        // Add sector breakdown if available
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

  if (!raceData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-card-foreground mb-2">
            No Race Data Available
          </h3>
          <p className="text-muted-foreground">
            Please load a race dataset to view the timeline.
          </p>
        </div>
      </div>
    );
  }

  // Phase 4: Enhanced data validation error handling
  if (dataValidation && !dataValidation.canProceed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold text-card-foreground mb-2">
            Data Validation Failed
          </h3>
          <p className="text-muted-foreground mb-4">
            The race data contains critical issues that prevent timeline display.
          </p>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Data Quality:</strong> {dataValidation.dataQuality}</p>
            <p><strong>Completeness:</strong> {dataValidation.completeness}%</p>
            {dataValidation.errors.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-red-600 mb-2">Errors:</p>
                <ul className="text-left max-w-md mx-auto space-y-1">
                  {dataValidation.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            {dataValidation.fallbackOptions.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-blue-600 mb-2">Suggested Actions:</p>
                <ul className="text-left max-w-md mx-auto space-y-1">
                  {dataValidation.fallbackOptions.map((option, index) => (
                    <li key={index} className="text-sm text-blue-600">• {option}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Phase 4: Moderate data quality warning
  if (dataValidation && dataValidation.severity === 'moderate' && dataValidation.warnings.length > 0) {
    // Show warning but allow proceeding
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">Race Timeline</h1>
            <p className="text-muted-foreground">
              Track every significant moment for each car throughout the race
            </p>
          </div>
        </div>

        {/* Car Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Select Car
            </label>
            <CarSelectorDropdown
              raceData={raceData}
              selectedCarNumber={selectedCarNumber}
              onCarSelect={handleCarSelection}
            />
          </div>

          {/* Phase 3: Advanced Configuration */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Timeline Configuration
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Anomalous Lap Threshold */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Anomalous Lap Threshold
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={anomalousLapThreshold}
                    onChange={(e) => setAnomalousLapThreshold(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-card-foreground w-12">
                    {anomalousLapThreshold}%
                  </span>
                </div>
              </div>

              {/* Show Anomalous Laps Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Show Anomalous Laps
                </label>
                <button
                  onClick={() => setShowAnomalousLaps(!showAnomalousLaps)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${showAnomalousLaps ? 'bg-primary' : 'bg-muted'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${showAnomalousLaps ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Event Grouping */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Event Grouping
                </label>
                <select
                  value={eventGrouping}
                  onChange={(e) => setEventGrouping(e.target.value as 'chronological' | 'by_type')}
                  className="text-xs bg-muted border border-border rounded px-2 py-1"
                >
                  <option value="chronological">By Lap</option>
                  <option value="by_type">By Type</option>
                </select>
              </div>
            </div>

            {/* Event Statistics */}
            {selectedCarNumber && timelineEvents.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {timelineEvents.filter(e => e.type === 'pit_stop').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Pit Stops</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {timelineEvents.filter(e => e.type === 'fastest_lap' || e.type === 'fastest_sector').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Speed Records</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">
                      {timelineEvents.filter(e => e.type === 'anomalous_lap').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Anomalies</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data Status Info */}
          {availableFeatures && (
            <div className="text-sm text-muted-foreground">
              <span>Available events: </span>
              {availableFeatures.raceStart && <span className="text-green-600">Race Start</span>}
              {availableFeatures.pitStops && <span>, <span className="text-red-600">Pit Stops</span></span>}
              {availableFeatures.driverChanges && <span>, <span className="text-purple-600">Driver Changes</span></span>}
              {availableFeatures.fastestLaps && <span>, <span className="text-blue-600">Fastest Laps</span></span>}
              {availableFeatures.fastestSectors && <span>, <span className="text-indigo-600">Fastest Sectors</span></span>}
              {availableFeatures.anomalousLaps && <span>, <span className="text-orange-600">Anomalous Laps</span></span>}
            </div>
          )}

          {/* Phase 4: Data Quality Warning */}
          {dataValidation && dataValidation.severity === 'moderate' && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Data Quality Warning
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Some features may be limited due to incomplete data ({dataValidation.completeness}% complete)
                </p>
                {dataValidation.warnings.length > 0 && (
                  <ul className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 space-y-1">
                    {dataValidation.warnings.slice(0, 2).map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Phase 4: Edge Case Notifications */}
          {edgeCases && edgeCases.hasIssues && edgeCases.issues.some(i => i.severity === 'critical' || i.severity === 'moderate') && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <Info className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Data Issues Detected
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  {edgeCases.issues.length} issue{edgeCases.issues.length !== 1 ? 's' : ''} found that may affect timeline display
                </p>
                {edgeCases.recommendations.length > 0 && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {edgeCases.recommendations[0]}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Phase 4: Processing Error Display */}
          {processingError && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Processing Error
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {processingError}
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Content */}
      {!selectedCarNumber ? (
        <div className="text-center py-16">
          <Car className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-2xl font-semibold text-card-foreground mb-2">
            Select a Car to View Timeline
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose a car from the dropdown above to see all race events, including pit stops, 
            fastest laps, driver changes, and anomalous laps.
          </p>
        </div>
      ) : isProcessing ? (
        <div className="text-center py-16">
          <Loader2 className="h-12 w-12 mx-auto mb-6 text-primary animate-spin" />
          <h3 className="text-xl font-semibold text-card-foreground mb-2">
            Loading Timeline Events
          </h3>
          <p className="text-muted-foreground">
            Processing race data for car #{selectedCarNumber}...
          </p>
        </div>
      ) : (
        <Suspense fallback={
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 mx-auto mb-6 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading timeline...</p>
          </div>
        }>
          <div className="space-y-6">
          {/* Selected Car Info */}
          {selectedCarInfo && (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">
                      #{selectedCarInfo.number}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-card-foreground">
                      {selectedCarInfo.driver}
                    </h2>
                    <p className="text-muted-foreground">{selectedCarInfo.team}</p>
                    {selectedCarInfo.manufacturer && (
                      <p className="text-sm text-primary font-medium">
                        {selectedCarInfo.manufacturer}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total Events</div>
                  <div className="text-3xl font-bold text-primary">{timelineEvents.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Events */}
          {timelineEvents.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                No Events Found
              </h3>
              <p className="text-muted-foreground">
                This car has no recorded race events in the timeline.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {timelineEvents.map((event, index) => {
                const isExpanded = expandedEventIds.has(event.id);
                const eventDetails = formatEventDetails(event);
                const hasDetails = eventDetails.length > 0;

                return (
                  <div key={event.id}>
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
                    
                    <div
                      className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div 
                        className={`p-6 ${hasDetails ? 'cursor-pointer' : ''}`}
                        onClick={hasDetails ? () => toggleEventExpansion(event.id) : undefined}
                      >
                        <div className="flex items-start gap-4">
                          {/* Timeline Line */}
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}>
                              {getEventIcon(event.type)}
                            </div>
                            {index < timelineEvents.length - 1 && (
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
              })}
            </div>
          )}
          </div>
        </Suspense>
      )}
    </div>
  );
};

export default RaceTimelineDashboard;
