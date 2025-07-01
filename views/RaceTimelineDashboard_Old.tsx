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

  const getEventColor = (type: string) => {
    switch (type) {
      case 'race_start':
        return 'text-success bg-success/10 border-success/20';
      case 'race_end':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'pit_stop':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'fastest_lap':
        return 'text-info bg-info/10 border-info/20';
      default:
        return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  if (!raceData) {
    return (
      <div className="text-center py-16">
        <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-card-foreground mb-2">No Race Data</h2>
        <p className="text-muted-foreground">Load race data to view the timeline</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-card-foreground mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary-foreground" />
            </div>
            Race Timeline
          </h1>
          <p className="text-muted-foreground text-lg">
            Follow the race progression with key events and milestones
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-4">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{allCars.length}</div>
            <div className="text-sm text-muted-foreground">Cars</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {raceData.race_strategy_by_car ? 
                raceData.race_strategy_by_car.reduce((sum, car) => sum + car.total_pit_stops, 0) :
                0
              }
            </div>
            <div className="text-sm text-muted-foreground">Pit Stops</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-info">{timelineEvents.length}</div>
            <div className="text-sm text-muted-foreground">Events</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Car Selection */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Cars to Follow
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {allCars.map(car => (
              <button
                key={car.number}
                onClick={() => toggleCarSelection(car.number)}
                className={`
                  p-3 rounded-lg border text-sm font-medium transition-all duration-200
                  ${selectedCars.includes(car.number)
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                    : 'bg-card text-card-foreground border-border hover:bg-accent hover:border-accent-foreground/20'
                  }
                `}
              >
                <div className="font-bold">#{car.number}</div>
                <div className="text-xs opacity-90 truncate">{car.driver}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setSelectedCars(allCars.map(c => c.number))}
              className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedCars([])}
              className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Event Type Filter */}
        <div className="lg:w-64">
          <h3 className="text-lg font-semibold text-card-foreground mb-3">Event Filter</h3>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Events', icon: Clock },
              { value: 'race_events', label: 'Race Events', icon: Flag },
              { value: 'pit_stop', label: 'Pit Stops', icon: AlertCircle },
              { value: 'fastest_lap', label: 'Fastest Laps', icon: Zap }
            ].map(filter => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value as any)}
                  className={`
                    w-full p-3 rounded-lg border text-left transition-all duration-200 flex items-center gap-3
                    ${filterType === filter.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-card-foreground border-border hover:bg-accent'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-xl font-semibold text-card-foreground mb-6 flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Race Timeline
        </h3>

        {timelineEvents.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events match your current filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center
                    ${getEventColor(event.type)}
                  `}>
                    {getEventIcon(event.type)}
                  </div>
                  {index < timelineEvents.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2"></div>
                  )}
                </div>

                {/* Event Content */}
                <div className="flex-1 pb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-semibold text-card-foreground">
                          {event.description}
                        </span>
                        {event.carNumber !== 'ALL' && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-sm font-bold rounded-md">
                            #{event.carNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        <span className="font-medium">Lap {event.lap}</span>
                        {event.driver !== 'All Drivers' && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{event.driver}</span>
                          </>
                        )}
                        {event.team && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{event.team}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-mono font-bold text-primary">
                      {event.time}
                    </div>
                  </div>

                  {/* Additional Details */}
                  {event.details && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg text-sm">
                      {event.type === 'pit_stop' && (
                        <div className="flex gap-4">
                          <span>Stationary: <strong>{event.details.stationaryTime}</strong></span>
                          {event.details.driverChange && (
                            <span className="text-warning">Driver Change</span>
                          )}
                        </div>
                      )}
                      {event.type === 'fastest_lap' && (
                        <div>
                          Stint {event.details.stintId}, Lap {event.details.lapInStint} of stint
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RaceTimelineDashboard;
