/**
 * Data Validation Functions - Phase 1 Implementation
 * 
 * Comprehensive data validation functions to ensure race data completeness
 * and provide clear feedback on data structure issues.
 */

import { RaceData } from '../types/race-data';

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataFormat: 'comprehensive' | 'simple' | 'unknown';
  missingFields: string[];
  availableFeatures: string[];
}

/**
 * Performs comprehensive validation of race data structure
 */
export function validateRaceDataStructure(data: any): DataValidationResult {
  const result: DataValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    dataFormat: 'unknown',
    missingFields: [],
    availableFeatures: []
  };

  // Basic null/undefined checks
  if (!data) {
    result.errors.push('Race data is null or undefined');
    return result;
  }

  if (typeof data !== 'object') {
    result.errors.push('Race data is not an object');
    return result;
  }

  // Determine data format and validate accordingly
  if (isComprehensiveFormat(data)) {
    result.dataFormat = 'comprehensive';
    validateComprehensiveFormat(data, result);
  } else if (isSimpleFormat(data)) {
    result.dataFormat = 'simple';
    validateSimpleFormat(data, result);
  } else {
    result.errors.push('Unknown data format - does not match comprehensive or simple race data structure');
    return result;
  }

  // Set overall validity
  result.isValid = result.errors.length === 0;

  return result;
}

/**
 * Checks if data matches comprehensive format (impc_watkins_2025 style)
 */
function isComprehensiveFormat(data: any): boolean {
  return !!(
    data.race_strategy_by_car &&
    data.enhanced_strategy_analysis &&
    data.fastest_by_car_number
  );
}

/**
 * Checks if data matches simple format (test_race style)
 */
function isSimpleFormat(data: any): boolean {
  return !!(
    data.fastest_by_car_number &&
    !data.race_strategy_by_car
  );
}

/**
 * Validates comprehensive data format
 */
function validateComprehensiveFormat(data: any, result: DataValidationResult): void {
  // Required fields for comprehensive format
  const requiredFields = [
    'fastest_by_car_number',
    'race_strategy_by_car',
    'enhanced_strategy_analysis'
  ];

  const optionalFields = [
    'fastest_by_manufacturer',
    'driver_deltas_by_car',
    'traffic_management_analysis',
    'earliest_fastest_lap_drivers',
    'full_pit_cycle_analysis',
    'social_media_highlights'
  ];

  // Check required fields
  requiredFields.forEach(field => {
    if (!data[field]) {
      result.errors.push(`Missing required field: ${field}`);
      result.missingFields.push(field);
    } else {
      result.availableFeatures.push(field);
    }
  });

  // Check optional fields
  optionalFields.forEach(field => {
    if (data[field]) {
      result.availableFeatures.push(field);
    } else {
      result.warnings.push(`Optional field not available: ${field}`);
      result.missingFields.push(field);
    }
  });

  // Validate structure of key arrays
  if (data.fastest_by_car_number) {
    validateFastestByCarArray(data.fastest_by_car_number, result);
  }

  if (data.race_strategy_by_car) {
    validateRaceStrategyArray(data.race_strategy_by_car, result);
  }

  if (data.enhanced_strategy_analysis) {
    validateEnhancedStrategyArray(data.enhanced_strategy_analysis, result);
  }
}

/**
 * Validates simple data format
 */
function validateSimpleFormat(data: any, result: DataValidationResult): void {
  // Required fields for simple format
  const requiredFields = ['fastest_by_car_number'];
  const optionalFields = ['pit_stops', 'sector_analysis', 'race_name', 'circuit', 'date'];

  // Check required fields
  requiredFields.forEach(field => {
    if (!data[field]) {
      result.errors.push(`Missing required field: ${field}`);
      result.missingFields.push(field);
    } else {
      result.availableFeatures.push(field);
    }
  });

  // Check optional fields
  optionalFields.forEach(field => {
    if (data[field]) {
      result.availableFeatures.push(field);
    } else {
      result.warnings.push(`Optional field not available: ${field}`);
      result.missingFields.push(field);
    }
  });

  // Validate structure of key arrays
  if (data.fastest_by_car_number) {
    validateSimpleFastestByCarArray(data.fastest_by_car_number, result);
  }

  if (data.pit_stops) {
    validateSimplePitStopsArray(data.pit_stops, result);
  }
}

/**
 * Validates fastest_by_car_number array structure (comprehensive format)
 */
function validateFastestByCarArray(fastestByCar: any[], result: DataValidationResult): void {
  if (!Array.isArray(fastestByCar)) {
    result.errors.push('fastest_by_car_number is not an array');
    return;
  }

  if (fastestByCar.length === 0) {
    result.warnings.push('fastest_by_car_number array is empty');
    return;
  }

  fastestByCar.forEach((car, index) => {
    const requiredFields = ['car_number', 'fastest_lap', 'best_s1', 'best_s2', 'best_s3'];
    
    requiredFields.forEach(field => {
      if (!car[field]) {
        result.warnings.push(`Car ${index}: Missing ${field}`);
      }
    });

    // Validate fastest_lap structure
    if (car.fastest_lap) {
      const lapFields = ['time', 'driver_name', 'lap_number'];
      lapFields.forEach(field => {
        if (!car.fastest_lap[field]) {
          result.warnings.push(`Car ${index} fastest_lap: Missing ${field}`);
        }
      });
    }
  });
}

/**
 * Validates fastest_by_car_number array structure (simple format)
 */
function validateSimpleFastestByCarArray(fastestByCar: any[], result: DataValidationResult): void {
  if (!Array.isArray(fastestByCar)) {
    result.errors.push('fastest_by_car_number is not an array');
    return;
  }

  if (fastestByCar.length === 0) {
    result.warnings.push('fastest_by_car_number array is empty');
    return;
  }

  fastestByCar.forEach((car, index) => {
    const requiredFields = ['car_number', 'driver', 'team', 'fastest_lap'];
    
    requiredFields.forEach(field => {
      if (!car[field]) {
        result.warnings.push(`Car ${index}: Missing ${field}`);
      }
    });
  });
}

/**
 * Validates race_strategy_by_car array structure
 */
function validateRaceStrategyArray(raceStrategy: any[], result: DataValidationResult): void {
  if (!Array.isArray(raceStrategy)) {
    result.errors.push('race_strategy_by_car is not an array');
    return;
  }

  if (raceStrategy.length === 0) {
    result.warnings.push('race_strategy_by_car array is empty');
    return;
  }

  raceStrategy.forEach((car, index) => {
    const requiredFields = ['car_number', 'stints', 'pit_stop_details'];
    
    requiredFields.forEach(field => {
      if (!car[field]) {
        result.warnings.push(`Race strategy car ${index}: Missing ${field}`);
      }
    });

    // Check if car has pit stops
    if (car.pit_stop_details && Array.isArray(car.pit_stop_details)) {
      if (car.pit_stop_details.length === 0) {
        result.warnings.push(`Car ${car.car_number}: No pit stops recorded`);
      }
    }

    // Check if car has stints
    if (car.stints && Array.isArray(car.stints)) {
      if (car.stints.length === 0) {
        result.warnings.push(`Car ${car.car_number}: No stints recorded`);
      }
    }
  });
}

/**
 * Validates enhanced_strategy_analysis array structure
 */
function validateEnhancedStrategyArray(enhancedStrategy: any[], result: DataValidationResult): void {
  if (!Array.isArray(enhancedStrategy)) {
    result.errors.push('enhanced_strategy_analysis is not an array');
    return;
  }

  if (enhancedStrategy.length === 0) {
    result.warnings.push('enhanced_strategy_analysis array is empty');
    return;
  }

  enhancedStrategy.forEach((car, index) => {
    const requiredFields = ['car_number', 'team', 'manufacturer'];
    
    requiredFields.forEach(field => {
      if (!car[field]) {
        result.warnings.push(`Enhanced strategy car ${index}: Missing ${field}`);
      }
    });
  });
}

/**
 * Validates pit_stops array structure (simple format)
 */
function validateSimplePitStopsArray(pitStops: any[], result: DataValidationResult): void {
  if (!Array.isArray(pitStops)) {
    result.errors.push('pit_stops is not an array');
    return;
  }

  pitStops.forEach((pitStop, index) => {
    const requiredFields = ['car_number', 'lap'];
    
    requiredFields.forEach(field => {
      if (!pitStop[field]) {
        result.warnings.push(`Pit stop ${index}: Missing ${field}`);
      }
    });
  });
}

/**
 * Checks if specific timeline features are available in the data
 */
export function checkFeatureAvailability(data: any): {
  raceStart: boolean;
  pitStops: boolean;
  driverChanges: boolean;
  fastestLaps: boolean;
  fastestSectors: boolean;
  anomalousLaps: boolean;
} {
  const features = {
    raceStart: false,
    pitStops: false,
    driverChanges: false,
    fastestLaps: false,
    fastestSectors: false,
    anomalousLaps: false
  };

  if (!data) return features;

  // Race start is available if we have car data
  features.raceStart = !!(data.fastest_by_car_number || data.race_strategy_by_car);

  // Pit stops
  features.pitStops = !!(
    (data.race_strategy_by_car && data.race_strategy_by_car.some((car: any) => 
      car.pit_stop_details && car.pit_stop_details.length > 0
    )) ||
    (data.pit_stops && data.pit_stops.length > 0)
  );

  // Driver changes
  features.driverChanges = !!(
    data.race_strategy_by_car && data.race_strategy_by_car.some((car: any) => 
      car.driver_change_details && car.driver_change_details.length > 0
    )
  );

  // Fastest laps
  features.fastestLaps = !!(
    data.fastest_by_car_number || data.earliest_fastest_lap_drivers
  );

  // Fastest sectors
  features.fastestSectors = !!(
    data.fastest_by_car_number && data.fastest_by_car_number.some((car: any) => 
      car.best_s1 || car.best_s2 || car.best_s3
    )
  );

  // Anomalous laps (requires stint data with lap times)
  features.anomalousLaps = !!(
    data.race_strategy_by_car && data.race_strategy_by_car.some((car: any) => 
      car.stints && car.stints.some((stint: any) => 
        stint.laps && stint.laps.length > 0
      )
    )
  );

  return features;
}

/**
 * Gets a human-readable summary of data validation results
 */
export function getValidationSummary(result: DataValidationResult): string {
  const lines: string[] = [];
  
  lines.push(`Data Format: ${result.dataFormat}`);
  lines.push(`Validation Status: ${result.isValid ? 'VALID' : 'INVALID'}`);
  
  if (result.errors.length > 0) {
    lines.push(`\nErrors (${result.errors.length}):`);
    result.errors.forEach(error => lines.push(`  - ${error}`));
  }
  
  if (result.warnings.length > 0) {
    lines.push(`\nWarnings (${result.warnings.length}):`);
    result.warnings.forEach(warning => lines.push(`  - ${warning}`));
  }
  
  if (result.availableFeatures.length > 0) {
    lines.push(`\nAvailable Features (${result.availableFeatures.length}):`);
    result.availableFeatures.forEach(feature => lines.push(`  - ${feature}`));
  }
  
  if (result.missingFields.length > 0) {
    lines.push(`\nMissing Fields (${result.missingFields.length}):`);
    result.missingFields.forEach(field => lines.push(`  - ${field}`));
  }
  
  return lines.join('\n');
}
