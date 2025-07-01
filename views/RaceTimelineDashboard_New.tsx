import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  Clock, Flag, Zap, AlertCircle, Trophy, Car, Users, 
  ArrowRightLeft, Timer, Gauge, Activity, ChevronDown, ChevronUp 
} from 'lucide-react';
import CarSelectorDropdown from '../components/CarSelectorDropdown';
import { 
  extractAllEventsForCar, 
  validateRaceData,
  getAvailableCars 
} from '../utils/timeline-event-extractor';
import { 
  validateRaceDataStructure, 
  checkFeatureAvailability 
} from '../utils/data-validation';
import { TimelineEvent } from '../types/race-data';

const RaceTimelineDashboard: React.FC = () => {
  const { raceData } = useData();
  const [selectedCarNumber, setSelectedCarNumber] = useState<string | null>(null);
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(new Set());

  // Validate data and get available features
  const dataValidation = useMemo(() => {
    if (!raceData) return null;
    return validateRaceDataStructure(raceData);
  }, [raceData]);

  const availableFeatures = useMemo(() => {
    if (!raceData) return null;
    return checkFeatureAvailability(raceData);
  }, [raceData]);

  // Get timeline events for selected car
  const timelineEvents = useMemo(() => {
    if (!raceData || !selectedCarNumber) return [];
    return extractAllEventsForCar(raceData, selectedCarNumber);
  }, [raceData, selectedCarNumber]);

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
    const detailItems: { label: string; value: string }[] = [];

    switch (event.type) {
      case 'pit_stop':
        if (details.stationaryTime) {
          detailItems.push({ label: 'Stationary Time', value: details.stationaryTime });
        }
        if (details.driverChange) {
          detailItems.push({ label: 'Driver Change', value: 'Yes' });
        }
        if (details.tireChange) {
          detailItems.push({ label: 'Tire Change', value: details.tireChange });
        }
        if (details.duration) {
          detailItems.push({ label: 'Duration', value: details.duration });
        }
        break;
      
      case 'driver_change':
        if (details.fromDriver && details.toDriver) {
          detailItems.push({ 
            label: 'Change', 
            value: `${details.fromDriver} → ${details.toDriver}` 
          });
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
          detailItems.push({ label: 'Optimal Time', value: details.optimalTime });
        }
        break;
      
      case 'fastest_sector':
        if (details.sector) {
          detailItems.push({ label: 'Sector', value: `S${details.sector}` });
        }
        if (details.sectorTime) {
          detailItems.push({ label: 'Time', value: details.sectorTime });
        }
        break;
      
      case 'anomalous_lap':
        if (details.deviationPercentage) {
          detailItems.push({ 
            label: 'Deviation', 
            value: `+${details.deviationPercentage}%` 
          });
        }
        if (details.medianTime) {
          detailItems.push({ label: 'Median Time', value: details.medianTime });
        }
        if (details.suspectedCause) {
          detailItems.push({ 
            label: 'Suspected Cause', 
            value: details.suspectedCause.replace('_', ' ').toUpperCase() 
          });
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

  if (dataValidation && !dataValidation.isValid) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold text-card-foreground mb-2">
            Invalid Race Data
          </h3>
          <p className="text-muted-foreground mb-4">
            The race data format is not supported or contains errors.
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Data Format: {dataValidation.dataFormat}</p>
            <p>Errors: {dataValidation.errors.length}</p>
          </div>
        </div>
      </div>
    );
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
              onCarSelect={setSelectedCarNumber}
            />
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
      ) : (
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
                  <div
                    key={event.id}
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
                                <span className="text-sm font-medium text-muted-foreground">
                                  {getEventTypeLabel(event.type)}
                                </span>
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
                              <span className="text-sm font-semibold text-card-foreground">
                                {detail.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RaceTimelineDashboard;
