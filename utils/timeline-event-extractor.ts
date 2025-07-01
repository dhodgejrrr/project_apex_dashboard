/**
 * Timeline Event Extractor Utilities - Phase 1 Implementation
 * 
 * This module provides utility functions to extract timeline events from race_analysis.json data.
 * Supports both test_race and impc_watkins_2025 data formats with comprehensive error handling.
 */

import { 
  RaceData, 
  TimelineEvent, 
  RaceStartEvent, 
  AnomalousLapData, 
  FastestSectorEvent,
  YellowFlagData,
  CompleteRaceStartLineup 
} from '../types/race-data';

/**
 * Validates the basic structure of race data
 */
export function validateRaceData(data: any): boolean {
  if (!data || typeof data !== 'object') {
    console.error('Race data is null or not an object');
    return false;
  }

  // Check for required fields in either format
  const hasBasicFields = data.fastest_by_car_number || data.race_strategy_by_car;
  if (!hasBasicFields) {
    console.error('Race data missing required basic fields');
    return false;
  }

  return true;
}

/**
 * Extracts race start events from race data
 * Determines who starts in each car at the beginning of the race
 */
export function extractRaceStartEvents(raceData: RaceData): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  try {
    if (!validateRaceData(raceData)) {
      return events;
    }

    // Handle comprehensive race data format (impc_watkins_2025)
    if (raceData.race_strategy_by_car && raceData.enhanced_strategy_analysis) {
      raceData.race_strategy_by_car.forEach(car => {
        const enhancedData = raceData.enhanced_strategy_analysis.find(e => e.car_number === car.car_number);
        const firstStint = car.stints[0];
        
        if (firstStint) {
          // Try to get starting driver from driver changes or assume first stint driver
          let startingDriver = 'Unknown Driver';
          if (car.driver_change_details.length > 0) {
            // If there are driver changes, the "from_driver" of the first change is likely the starter
            startingDriver = car.driver_change_details[0].from_driver;
          } else {
            // Try to get from fastest lap data
            const fastestCar = raceData.fastest_by_car_number?.find(f => f.car_number === car.car_number);
            if (fastestCar) {
              startingDriver = fastestCar.fastest_lap.driver_name;
            }
          }

          events.push({
            id: `race-start-${car.car_number}`,
            lap: 0,
            type: 'race_start',
            carNumber: car.car_number,
            driver: startingDriver,
            team: enhancedData?.team || 'Unknown Team',
            manufacturer: enhancedData?.manufacturer || 'Unknown',
            description: `Race Start - ${startingDriver}`,
            time: '00:00:00',
            details: {
              gridPosition: null, // Not available in current data structure
              stintId: firstStint ? `stint_${firstStint.stint_number}` : null
            }
          });
        }
      });
    }
    // Handle simple test race format
    else if (raceData.fastest_by_car_number) {
      raceData.fastest_by_car_number.forEach((car: any) => {
        events.push({
          id: `race-start-${car.car_number}`,
          lap: 0,
          type: 'race_start',
          carNumber: car.car_number,
          driver: car.driver || car.driver_name || 'Unknown Driver',
          team: car.team || 'Unknown Team',
          manufacturer: 'Unknown',
          description: `Race Start - ${car.driver || car.driver_name}`,
          time: '00:00:00',
          details: {
            gridPosition: car.position || null,
            fastestLap: car.fastest_lap
          }
        });
      });
    }

  } catch (error) {
    console.error('Error extracting race start events:', error);
  }

  return events.sort((a, b) => a.carNumber.localeCompare(b.carNumber));
}

/**
 * Extracts all pit stop events from race data
 */
export function extractPitStopEvents(raceData: RaceData): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  try {
    if (!validateRaceData(raceData)) {
      return events;
    }

    // Handle comprehensive race data format
    if (raceData.race_strategy_by_car) {
      raceData.race_strategy_by_car.forEach(car => {
        const enhancedData = raceData.enhanced_strategy_analysis?.find(e => e.car_number === car.car_number);
        
        car.pit_stop_details.forEach(pitStop => {
          events.push({
            id: `pit-${car.car_number}-${pitStop.stop_number}`,
            lap: pitStop.lap_number_entry,
            type: 'pit_stop',
            carNumber: car.car_number,
            driver: 'Driver TBD', // Need to determine driver at this lap
            team: enhancedData?.team || 'Unknown Team',
            manufacturer: enhancedData?.manufacturer || 'Unknown',
            description: `Pit Stop #${pitStop.stop_number}`,
            time: pitStop.total_pit_lane_time,
            details: {
              stopNumber: pitStop.stop_number,
              stationaryTime: pitStop.stationary_time,
              driverChange: pitStop.driver_change,
              entryLap: pitStop.lap_number_entry
            }
          });
        });
      });
    }
    // Handle simple test race format
    else if ((raceData as any).pit_stops) {
      (raceData as any).pit_stops.forEach((pitStop: any) => {
        const carData = raceData.fastest_by_car_number?.find(c => c.car_number === pitStop.car_number);
        
        events.push({
          id: `pit-${pitStop.car_number}-${pitStop.lap}`,
          lap: pitStop.lap,
          type: 'pit_stop',
          carNumber: pitStop.car_number,
          driver: carData?.fastest_lap?.driver_name || 'Unknown Driver',
          team: carData ? 'team' in carData ? (carData as any).team : 'Unknown Team' : 'Unknown Team',
          manufacturer: 'Unknown',
          description: `Pit Stop`,
          time: pitStop.duration || 'Unknown',
          details: {
            duration: pitStop.duration,
            tireChange: pitStop.tire_change,
            lap: pitStop.lap
          }
        });
      });
    }

  } catch (error) {
    console.error('Error extracting pit stop events:', error);
  }

  return events.sort((a, b) => a.lap - b.lap);
}

/**
 * Extracts driver change events from race data
 */
export function extractDriverChangeEvents(raceData: RaceData): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  try {
    if (!validateRaceData(raceData) || !raceData.race_strategy_by_car) {
      return events;
    }

    raceData.race_strategy_by_car.forEach(car => {
      const enhancedData = raceData.enhanced_strategy_analysis?.find(e => e.car_number === car.car_number);
      
      car.driver_change_details.forEach(change => {
        events.push({
          id: `driver-change-${car.car_number}-${change.lap_number}`,
          lap: change.lap_number,
          type: 'driver_change',
          carNumber: car.car_number,
          driver: change.to_driver,
          team: enhancedData?.team || 'Unknown Team',
          manufacturer: enhancedData?.manufacturer || 'Unknown',
          description: `Driver Change: ${change.from_driver} → ${change.to_driver}`,
          time: 'During Pit Stop',
          details: {
            fromDriver: change.from_driver,
            toDriver: change.to_driver,
            lapNumber: change.lap_number
          }
        });
      });
    });

  } catch (error) {
    console.error('Error extracting driver change events:', error);
  }

  return events.sort((a, b) => a.lap - b.lap);
}

/**
 * Extracts fastest lap events for each driver/car combination
 */
export function extractFastestLapEvents(raceData: RaceData): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  try {
    if (!validateRaceData(raceData)) {
      return events;
    }

    // Handle comprehensive race data format
    if (raceData.earliest_fastest_lap_drivers) {
      raceData.earliest_fastest_lap_drivers.forEach(fastestLap => {
        events.push({
          id: `fastest-lap-${fastestLap.car_number}-${fastestLap.driver_name}`,
          lap: fastestLap.lap_number_race,
          type: 'fastest_lap',
          carNumber: fastestLap.car_number,
          driver: fastestLap.driver_name,
          team: fastestLap.team,
          manufacturer: 'Unknown', // Not available in current structure
          description: `Fastest Lap - ${fastestLap.fastest_lap_time}`,
          time: fastestLap.fastest_lap_time,
          details: {
            stintId: fastestLap.stint_id,
            lapInStint: fastestLap.lap_in_stint,
            rank: fastestLap.rank
          }
        });
      });
    }
    // Handle fastest_by_car_number data
    else if (raceData.fastest_by_car_number) {
      raceData.fastest_by_car_number.forEach(car => {
        events.push({
          id: `fastest-lap-${car.car_number}`,
          lap: car.fastest_lap.lap_number,
          type: 'fastest_lap',
          carNumber: car.car_number,
          driver: car.fastest_lap.driver_name,
          team: 'team' in car ? (car as any).team : 'Unknown Team',
          manufacturer: 'Unknown',
          description: `Fastest Lap - ${car.fastest_lap.time}`,
          time: car.fastest_lap.time,
          details: {
            optimalTime: car.optimal_lap_time,
            bestS1: car.best_s1,
            bestS2: car.best_s2,
            bestS3: car.best_s3
          }
        });
      });
    }

  } catch (error) {
    console.error('Error extracting fastest lap events:', error);
  }

  return events.sort((a, b) => a.lap - b.lap);
}

/**
 * Extracts fastest sector events (S1, S2, S3) for each driver/car combination
 */
export function extractFastestSectorEvents(raceData: RaceData): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  try {
    if (!validateRaceData(raceData) || !raceData.fastest_by_car_number) {
      return events;
    }

    raceData.fastest_by_car_number.forEach(car => {
      // Extract fastest S1
      if (car.best_s1) {
        events.push({
          id: `fastest-s1-${car.car_number}`,
          lap: car.best_s1.lap_number,
          type: 'fastest_sector',
          carNumber: car.car_number,
          driver: car.best_s1.driver_name,
          team: 'team' in car ? (car as any).team : 'Unknown Team',
          manufacturer: 'Unknown',
          description: `Fastest Sector 1 - ${car.best_s1.time}`,
          time: car.best_s1.time,
          details: {
            sector: 1,
            sectorTime: car.best_s1.time
          }
        });
      }

      // Extract fastest S2
      if (car.best_s2) {
        events.push({
          id: `fastest-s2-${car.car_number}`,
          lap: car.best_s2.lap_number,
          type: 'fastest_sector',
          carNumber: car.car_number,
          driver: car.best_s2.driver_name,
          team: 'team' in car ? (car as any).team : 'Unknown Team',
          manufacturer: 'Unknown',
          description: `Fastest Sector 2 - ${car.best_s2.time}`,
          time: car.best_s2.time,
          details: {
            sector: 2,
            sectorTime: car.best_s2.time
          }
        });
      }

      // Extract fastest S3
      if (car.best_s3) {
        events.push({
          id: `fastest-s3-${car.car_number}`,
          lap: car.best_s3.lap_number,
          type: 'fastest_sector',
          carNumber: car.car_number,
          driver: car.best_s3.driver_name,
          team: 'team' in car ? (car as any).team : 'Unknown Team',
          manufacturer: 'Unknown',
          description: `Fastest Sector 3 - ${car.best_s3.time}`,
          time: car.best_s3.time,
          details: {
            sector: 3,
            sectorTime: car.best_s3.time
          }
        });
      }
    });

  } catch (error) {
    console.error('Error extracting fastest sector events:', error);
  }

  return events.sort((a, b) => a.lap - b.lap);
}

/**
 * Extracts anomalous lap events (laps above threshold, excluding yellow flags)
 * Default threshold is 5% slower than driver's median clean lap time
 */
export function extractAnomalousLapEvents(
  raceData: RaceData, 
  thresholdPercentage: number = 5
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  try {
    if (!validateRaceData(raceData) || !raceData.race_strategy_by_car) {
      return events;
    }

    raceData.race_strategy_by_car.forEach(car => {
      const enhancedData = raceData.enhanced_strategy_analysis?.find(e => e.car_number === car.car_number);
      
      // Calculate median lap times for each stint (as proxy for different drivers)
      car.stints.forEach((stint, stintIndex) => {
        if (stint.laps && stint.laps.length > 0) {
          // Get clean lap times (exclude outliers and problematic laps)
          // Note: We're using stint.yellow_laps and stint.red_laps as proxies for flagged conditions
          const isStintWithFlags = stint.yellow_laps > 0 || stint.red_laps > 0;
          
          const cleanLaps = stint.laps.filter(lap => 
            lap.LAP_TIME_FUEL_CORRECTED_SEC > 0 && 
            lap.LAP_TIME_FUEL_CORRECTED_SEC < 200 // Reasonable lap time limit
          );

          if (cleanLaps.length > 2) {
            // Calculate median using fuel-corrected times
            const sortedTimes = cleanLaps
              .map(lap => lap.LAP_TIME_FUEL_CORRECTED_SEC)
              .sort((a, b) => a - b);
            
            const median = sortedTimes[Math.floor(sortedTimes.length / 2)];
            const threshold = median * (1 + thresholdPercentage / 100);

            // Find anomalous laps
            stint.laps.forEach((lap, lapIndex) => {
              if (lap.LAP_TIME_FUEL_CORRECTED_SEC > threshold) {
                
                const lapNumber = stint.lap_range ? 
                  parseInt(stint.lap_range.split('-')[0]) + lapIndex : 
                  lapIndex + 1;

                const deviationPercentage = ((lap.LAP_TIME_FUEL_CORRECTED_SEC - median) / median) * 100;

                // Analyze suspected cause based on deviation
                let suspectedCause: 'traffic' | 'mistake' | 'pace_drop' | 'overtaken' | 'unknown' = 'unknown';
                if (deviationPercentage > 15) {
                  suspectedCause = 'mistake';
                } else if (deviationPercentage > 10) {
                  suspectedCause = 'traffic';
                } else if (deviationPercentage > 7) {
                  suspectedCause = 'pace_drop';
                } else {
                  suspectedCause = 'overtaken';
                }

                // Get driver information - use enhanced analysis for driver data
                const driverInfo = enhancedData?.team || 'Unknown Driver';

                events.push({
                  id: `anomalous-${car.car_number}-${lapNumber}`,
                  lap: lapNumber,
                  type: 'anomalous_lap',
                  carNumber: car.car_number,
                  driver: driverInfo,
                  team: enhancedData?.team || 'Unknown Team',
                  manufacturer: enhancedData?.manufacturer || 'Unknown',
                  description: `Anomalous Lap (+${deviationPercentage.toFixed(1)}% slower)`,
                  time: `${lap.LAP_TIME_FUEL_CORRECTED_SEC.toFixed(3)}s`,
                  details: {
                    medianTime: `${median.toFixed(3)}s`,
                    deviationPercentage: deviationPercentage.toFixed(1),
                    suspectedCause,
                    stintNumber: stintIndex + 1,
                    lapInStint: lapIndex + 1,
                    flaggedStint: isStintWithFlags
                  }
                });
              }
            });
          }
        }
      });
    });

    return events.sort((a, b) => a.lap - b.lap);
  } catch (error) {
    console.warn('Error extracting anomalous lap events:', error);
    return events;
  }
}

/**
 * Aggregates all timeline events for a specific car
 */
export function extractAllEventsForCar(raceData: RaceData, carNumber: string): TimelineEvent[] {
  const allEvents: TimelineEvent[] = [
    ...extractRaceStartEvents(raceData),
    ...extractPitStopEvents(raceData),
    ...extractDriverChangeEvents(raceData),
    ...extractFastestLapEvents(raceData),
    ...extractFastestSectorEvents(raceData),
    ...extractAnomalousLapEvents(raceData)
  ];

  return allEvents
    .filter(event => event.carNumber === carNumber)
    .sort((a, b) => {
      // Sort by lap number, then by event priority
      if (a.lap !== b.lap) return a.lap - b.lap;
      
      // Event priority: race_start, pit_stop, driver_change, fastest_lap, fastest_sector, anomalous_lap
      const eventPriority = {
        'race_start': 1,
        'pit_stop': 2,
        'driver_change': 3,
        'fastest_lap': 4,
        'fastest_sector': 5,
        'anomalous_lap': 6
      };
      
      return eventPriority[a.type] - eventPriority[b.type];
    });
}

/**
 * Gets all available cars from race data
 */
export function getAvailableCars(raceData: RaceData): Array<{
  number: string;
  driver: string;
  team: string;
  manufacturer?: string;
}> {
  const cars: Array<{number: string, driver: string, team: string, manufacturer?: string}> = [];

  try {
    if (!validateRaceData(raceData)) {
      return cars;
    }

    if (raceData.fastest_by_car_number) {
      raceData.fastest_by_car_number.forEach(car => {
        const enhancedData = raceData.enhanced_strategy_analysis?.find(e => e.car_number === car.car_number);
        
        cars.push({
          number: car.car_number,
          driver: car.fastest_lap.driver_name,
          team: enhancedData?.team || ('team' in car ? (car as any).team : 'Unknown Team'),
          manufacturer: enhancedData?.manufacturer
        });
      });
    }

  } catch (error) {
    console.error('Error getting available cars:', error);
  }

  return cars.sort((a, b) => {
    const aNum = parseInt(a.number) || 999;
    const bNum = parseInt(b.number) || 999;
    return aNum - bNum;
  });
}
