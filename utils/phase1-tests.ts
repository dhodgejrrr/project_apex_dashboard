/**
 * Phase 1 Implementation Test - Timeline Event Extraction
 * 
 * This test file validates the Phase 1 implementation by testing the extraction
 * functions with the available test data.
 */

import { 
  extractRaceStartEvents,
  extractPitStopEvents,
  extractDriverChangeEvents,
  extractFastestLapEvents,
  extractFastestSectorEvents,
  extractAnomalousLapEvents,
  extractAllEventsForCar,
  getAvailableCars,
  validateRaceData
} from '../utils/timeline-event-extractor';

import { 
  validateRaceDataStructure,
  checkFeatureAvailability,
  getValidationSummary
} from '../utils/data-validation';

/**
 * Test data based on the test_race format
 */
const testRaceData = {
  race_name: "Monaco Grand Prix 2024",
  circuit: "Circuit de Monaco",
  date: "2024-05-26",
  weather: "Sunny, 24°C",
  fastest_by_car_number: [
    {
      car_number: "1",
      driver: "Max Verstappen",
      team: "Red Bull Racing",
      fastest_lap: {
        time: "1:12.345",
        driver_name: "Max Verstappen",
        lap_number: 42
      },
      best_s1: {
        time: "24.123",
        driver_name: "Max Verstappen",
        lap_number: 42
      },
      best_s2: {
        time: "28.456",
        driver_name: "Max Verstappen", 
        lap_number: 42
      },
      best_s3: {
        time: "19.789",
        driver_name: "Max Verstappen",
        lap_number: 42
      },
      gap_to_leader: "0.000",
      position: 1
    },
    {
      car_number: "16",
      driver: "Charles Leclerc",
      team: "Ferrari",
      fastest_lap: {
        time: "1:12.567",
        driver_name: "Charles Leclerc",
        lap_number: 38
      },
      best_s1: {
        time: "24.200",
        driver_name: "Charles Leclerc",
        lap_number: 38
      },
      best_s2: {
        time: "28.400",
        driver_name: "Charles Leclerc",
        lap_number: 45
      },
      best_s3: {
        time: "19.800",
        driver_name: "Charles Leclerc",
        lap_number: 38
      },
      gap_to_leader: "+0.234",
      position: 2
    }
  ],
  sector_analysis: {
    sector_1: {
      fastest_time: "24.123",
      fastest_car: "1"
    },
    sector_2: {
      fastest_time: "28.400", 
      fastest_car: "16"
    },
    sector_3: {
      fastest_time: "19.789",
      fastest_car: "1"
    }
  },
  pit_stops: [
    {
      car_number: "1",
      lap: 25,
      duration: "2.4s",
      tire_change: "Medium to Hard"
    },
    {
      car_number: "16", 
      lap: 28,
      duration: "2.6s",
      tire_change: "Medium to Hard"
    }
  ]
};

/**
 * Run Phase 1 validation tests
 */
export function runPhase1Tests(): void {
  console.log('=== Phase 1 Implementation Tests ===\n');

  // Test 1: Data Validation
  console.log('1. Testing Data Validation...');
  const validationResult = validateRaceDataStructure(testRaceData);
  console.log('Validation Result:', validationResult.isValid ? 'PASS' : 'FAIL');
  console.log('Data Format:', validationResult.dataFormat);
  console.log('Errors:', validationResult.errors.length);
  console.log('Warnings:', validationResult.warnings.length);
  console.log('Available Features:', validationResult.availableFeatures.length);
  console.log('');

  // Test 2: Feature Availability
  console.log('2. Testing Feature Availability...');
  const features = checkFeatureAvailability(testRaceData);
  console.log('Race Start:', features.raceStart ? 'Available' : 'Not Available');
  console.log('Pit Stops:', features.pitStops ? 'Available' : 'Not Available');
  console.log('Driver Changes:', features.driverChanges ? 'Available' : 'Not Available');
  console.log('Fastest Laps:', features.fastestLaps ? 'Available' : 'Not Available');
  console.log('Fastest Sectors:', features.fastestSectors ? 'Available' : 'Not Available');
  console.log('Anomalous Laps:', features.anomalousLaps ? 'Available' : 'Not Available');
  console.log('');

  // Test 3: Available Cars
  console.log('3. Testing Available Cars Extraction...');
  const cars = getAvailableCars(testRaceData as any);
  console.log(`Found ${cars.length} cars:`);
  cars.forEach(car => {
    console.log(`  #${car.number} - ${car.driver} (${car.team})`);
  });
  console.log('');

  // Test 4: Race Start Events
  console.log('4. Testing Race Start Events...');
  const raceStartEvents = extractRaceStartEvents(testRaceData as any);
  console.log(`Extracted ${raceStartEvents.length} race start events:`);
  raceStartEvents.forEach(event => {
    console.log(`  ${event.description} - Car #${event.carNumber} (${event.driver})`);
  });
  console.log('');

  // Test 5: Pit Stop Events
  console.log('5. Testing Pit Stop Events...');
  const pitStopEvents = extractPitStopEvents(testRaceData as any);
  console.log(`Extracted ${pitStopEvents.length} pit stop events:`);
  pitStopEvents.forEach(event => {
    console.log(`  Lap ${event.lap}: ${event.description} - Car #${event.carNumber} (${event.time})`);
  });
  console.log('');

  // Test 6: Fastest Lap Events
  console.log('6. Testing Fastest Lap Events...');
  const fastestLapEvents = extractFastestLapEvents(testRaceData as any);
  console.log(`Extracted ${fastestLapEvents.length} fastest lap events:`);
  fastestLapEvents.forEach(event => {
    console.log(`  Lap ${event.lap}: ${event.description} - Car #${event.carNumber} (${event.time})`);
  });
  console.log('');

  // Test 7: Fastest Sector Events
  console.log('7. Testing Fastest Sector Events...');
  const fastestSectorEvents = extractFastestSectorEvents(testRaceData as any);
  console.log(`Extracted ${fastestSectorEvents.length} fastest sector events:`);
  fastestSectorEvents.forEach(event => {
    console.log(`  Lap ${event.lap}: ${event.description} - Car #${event.carNumber} (${event.time})`);
  });
  console.log('');

  // Test 8: All Events for Specific Car
  console.log('8. Testing All Events for Car #1...');
  const car1Events = extractAllEventsForCar(testRaceData as any, "1");
  console.log(`Found ${car1Events.length} events for Car #1:`);
  car1Events.forEach(event => {
    console.log(`  Lap ${event.lap}: ${event.type} - ${event.description}`);
  });
  console.log('');

  // Test 9: Driver Change Events (should be empty for simple format)
  console.log('9. Testing Driver Change Events...');
  const driverChangeEvents = extractDriverChangeEvents(testRaceData as any);
  console.log(`Extracted ${driverChangeEvents.length} driver change events (expected 0 for simple format)`);
  console.log('');

  // Test 10: Anomalous Lap Events (should be empty for simple format)
  console.log('10. Testing Anomalous Lap Events...');
  const anomalousLapEvents = extractAnomalousLapEvents(testRaceData as any);
  console.log(`Extracted ${anomalousLapEvents.length} anomalous lap events (expected 0 for simple format)`);
  console.log('');

  console.log('=== Phase 1 Tests Complete ===');
  console.log('Summary:');
  console.log(`- Data validation: ${validationResult.isValid ? 'PASS' : 'FAIL'}`);
  console.log(`- Feature detection: ${Object.values(features).filter(Boolean).length}/6 features available`);
  console.log(`- Event extraction: ${raceStartEvents.length + pitStopEvents.length + fastestLapEvents.length + fastestSectorEvents.length} total events`);
  console.log(`- Cars available: ${cars.length}`);
}

/**
 * Test with empty/null data
 */
export function runErrorHandlingTests(): void {
  console.log('\n=== Error Handling Tests ===\n');

  // Test with null data
  console.log('1. Testing with null data...');
  const nullValidation = validateRaceDataStructure(null);
  console.log('Null data validation:', nullValidation.isValid ? 'UNEXPECTED PASS' : 'PASS');

  // Test with empty object
  console.log('2. Testing with empty object...');
  const emptyValidation = validateRaceDataStructure({});
  console.log('Empty object validation:', emptyValidation.isValid ? 'UNEXPECTED PASS' : 'PASS');

  // Test extraction with null data
  console.log('3. Testing extraction functions with null data...');
  const nullEvents = extractAllEventsForCar(null as any, "1");
  console.log('Null data extraction:', nullEvents.length === 0 ? 'PASS' : 'FAIL');

  console.log('=== Error Handling Tests Complete ===');
}

// Export test functions for use in development
if (typeof window !== 'undefined') {
  (window as any).runPhase1Tests = runPhase1Tests;
  (window as any).runErrorHandlingTests = runErrorHandlingTests;
}
