/**
 * Enhanced Data Validation Functions - Phase 4 Implementation
 * 
 * Comprehensive data validation with robust error handling, graceful degradation,
 * and detailed feedback for edge cases and missing data scenarios.
 */

import { RaceData } from '../types/race-data';

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  dataFormat: 'comprehensive' | 'simple' | 'unknown';
  missingFields: string[];
  availableFeatures: string[];
  // Phase 4 additions
  severity: 'critical' | 'moderate' | 'minor' | 'info';
  canProceed: boolean;
  fallbackOptions: string[];
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  completeness: number; // percentage 0-100
}

export interface FeatureAvailability {
  raceStart: boolean;
  pitStops: boolean;
  driverChanges: boolean;
  fastestLaps: boolean;
  fastestSectors: boolean;
  anomalousLaps: boolean;
  enhancedAnalysis: boolean;
}

export interface EdgeCaseResult {
  hasIssues: boolean;
  issues: {
    type: 'missing_data' | 'incomplete_stint' | 'orphaned_change' | 'missing_sectors' | 'dns_dnf' | 'data_corruption';
    severity: 'critical' | 'moderate' | 'minor';
    description: string;
    fallbackStrategy: string;
    affectedFeatures: string[];
  }[];
  recommendations: string[];
}

/**
 * Phase 4: Enhanced data structure validation with comprehensive error handling
 */
export function validateRaceDataStructure(data: any): DataValidationResult {
  const result: DataValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    dataFormat: 'unknown',
    missingFields: [],
    availableFeatures: [],
    severity: 'critical',
    canProceed: false,
    fallbackOptions: [],
    dataQuality: 'poor',
    completeness: 0
  };

  try {
    // Basic null/undefined checks
    if (!data) {
      result.errors.push('Race data is null or undefined');
      result.severity = 'critical';
      result.fallbackOptions = ['Load a different dataset', 'Check data source'];
      return result;
    }

    if (typeof data !== 'object') {
      result.errors.push('Race data is not an object');
      result.severity = 'critical';
      result.fallbackOptions = ['Verify data format', 'Check JSON structure'];
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
      result.errors.push('Unknown data format - neither comprehensive nor simple format detected');
      result.severity = 'critical';
      result.fallbackOptions = ['Check data structure', 'Verify data source'];
      attemptPartialValidation(data, result);
    }

    // Calculate overall data quality and completeness
    calculateDataQuality(result);
    
    // Determine if processing can proceed
    result.canProceed = result.errors.length === 0 || result.severity !== 'critical';
    result.isValid = result.canProceed && result.availableFeatures.length > 0;

  } catch (error) {
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.severity = 'critical';
    result.fallbackOptions = ['Check data integrity', 'Contact support'];
  }

  return result;
}

/**
 * Check what features are available in the race data
 */
export function checkFeatureAvailability(data: any): FeatureAvailability {
  const features: FeatureAvailability = {
    raceStart: false,
    pitStops: false,
    driverChanges: false,
    fastestLaps: false,
    fastestSectors: false,
    anomalousLaps: false,
    enhancedAnalysis: false
  };

  try {
    if (!data) return features;

    // Check for race strategy data (pit stops, driver changes, stints)
    if (data.race_strategy_by_car && Array.isArray(data.race_strategy_by_car)) {
      features.raceStart = true;
      features.anomalousLaps = true; // Can calculate from stint data

      data.race_strategy_by_car.forEach((car: any) => {
        if (car.pit_stop_details && car.pit_stop_details.length > 0) {
          features.pitStops = true;
        }
        if (car.driver_change_details && car.driver_change_details.length > 0) {
          features.driverChanges = true;
        }
      });
    }

    // Check for fastest lap data
    if (data.fastest_by_car && Array.isArray(data.fastest_by_car)) {
      features.fastestLaps = true;
      
      data.fastest_by_car.forEach((car: any) => {
        if (car.best_s1 || car.best_s2 || car.best_s3) {
          features.fastestSectors = true;
        }
      });
    }

    // Check for enhanced analysis
    if (data.enhanced_strategy_analysis && Array.isArray(data.enhanced_strategy_analysis)) {
      features.enhancedAnalysis = true;
    }

  } catch (error) {
    console.warn('Error checking feature availability:', error);
  }

  return features;
}

/**
 * Phase 4: Comprehensive edge case detection and handling
 */
export function detectEdgeCases(data: any): EdgeCaseResult {
  const result: EdgeCaseResult = {
    hasIssues: false,
    issues: [],
    recommendations: []
  };

  try {
    if (!data) return result;

    // Check for DNS/DNF scenarios
    if (data.race_strategy_by_car) {
      data.race_strategy_by_car.forEach((car: any) => {
        if (!car.stints || car.stints.length === 0) {
          result.issues.push({
            type: 'dns_dnf',
            severity: 'moderate',
            description: `Car ${car.car_number} has no stint data (DNS/DNF)`,
            fallbackStrategy: 'Show car in list but with "No race data" message',
            affectedFeatures: ['Timeline events', 'Lap analysis']
          });
        }
      });
    }

    // Check for incomplete stint data
    if (data.race_strategy_by_car) {
      data.race_strategy_by_car.forEach((car: any) => {
        car.stints?.forEach((stint: any, stintIndex: number) => {
          if (!stint.laps || stint.laps.length === 0) {
            result.issues.push({
              type: 'incomplete_stint',
              severity: 'moderate',
              description: `Car ${car.car_number} stint ${stintIndex + 1} has no lap data`,
              fallbackStrategy: 'Use stint summary data or skip stint',
              affectedFeatures: ['Lap times', 'Anomaly detection']
            });
          }
        });
      });
    }

    // Check for orphaned driver changes
    if (data.race_strategy_by_car) {
      data.race_strategy_by_car.forEach((car: any) => {
        if (car.driver_change_details && car.driver_change_details.length > 0) {
          const pitStops = car.pit_stop_details || [];
          car.driver_change_details.forEach((change: any) => {
            const correspondingPitStop = pitStops.find(
              (pit: any) => pit.lap_number_entry === change.lap_number
            );
            if (!correspondingPitStop) {
              result.issues.push({
                type: 'orphaned_change',
                severity: 'minor',
                description: `Driver change on lap ${change.lap_number} for car ${car.car_number} has no corresponding pit stop`,
                fallbackStrategy: 'Show driver change as standalone event',
                affectedFeatures: ['Pit stop correlation']
              });
            }
          });
        }
      });
    }

    // Check for missing sector data in fastest laps
    if (data.fastest_by_car) {
      data.fastest_by_car.forEach((car: any) => {
        if (car.fastest_lap && (!car.best_s1 || !car.best_s2 || !car.best_s3)) {
          result.issues.push({
            type: 'missing_sectors',
            severity: 'minor',
            description: `Car ${car.car_number} has fastest lap but missing sector times`,
            fallbackStrategy: 'Show fastest lap without sector breakdown',
            affectedFeatures: ['Sector analysis', 'Optimal lap calculation']
          });
        }
      });
    }

    // Check for data corruption patterns
    if (data.race_strategy_by_car) {
      data.race_strategy_by_car.forEach((car: any) => {
        car.stints?.forEach((stint: any) => {
          stint.laps?.forEach((lap: any) => {
            if (lap.LAP_TIME_FUEL_CORRECTED_SEC && 
                (lap.LAP_TIME_FUEL_CORRECTED_SEC < 0 || lap.LAP_TIME_FUEL_CORRECTED_SEC > 1000)) {
              result.issues.push({
                type: 'data_corruption',
                severity: 'moderate',
                description: `Invalid lap time detected: ${lap.LAP_TIME_FUEL_CORRECTED_SEC}s`,
                fallbackStrategy: 'Exclude corrupted lap times from analysis',
                affectedFeatures: ['Lap time analysis', 'Anomaly detection']
              });
            }
          });
        });
      });
    }

    result.hasIssues = result.issues.length > 0;

    // Generate recommendations
    if (result.hasIssues) {
      const severityCount = {
        critical: result.issues.filter(i => i.severity === 'critical').length,
        moderate: result.issues.filter(i => i.severity === 'moderate').length,
        minor: result.issues.filter(i => i.severity === 'minor').length
      };

      if (severityCount.critical > 0) {
        result.recommendations.push('Critical data issues detected - some features may not work properly');
      }
      if (severityCount.moderate > 0) {
        result.recommendations.push('Some cars may have incomplete race data');
      }
      if (severityCount.minor > 0) {
        result.recommendations.push('Minor data inconsistencies detected - full functionality available');
      }
    }

  } catch (error) {
    result.issues.push({
      type: 'data_corruption',
      severity: 'critical',
      description: `Edge case detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      fallbackStrategy: 'Use basic validation only',
      affectedFeatures: ['All advanced features']
    });
    result.hasIssues = true;
  }

  return result;
}

/**
 * Check if data follows comprehensive format
 */
function isComprehensiveFormat(data: any): boolean {
  return !!(
    data.race_strategy_by_car &&
    data.enhanced_strategy_analysis &&
    data.fastest_by_car &&
    data.fastest_by_manufacturer
  );
}

/**
 * Check if data follows simple format
 */
function isSimpleFormat(data: any): boolean {
  return !!(
    data.race_strategy_by_car &&
    (data.fastest_by_car || data.enhanced_strategy_analysis)
  );
}

/**
 * Validate comprehensive format data
 */
function validateComprehensiveFormat(data: any, result: DataValidationResult): void {
  if (data.race_strategy_by_car) {
    result.availableFeatures.push('race_strategy', 'pit_stops', 'driver_changes', 'anomalous_laps');
  }
  
  if (data.enhanced_strategy_analysis) {
    result.availableFeatures.push('enhanced_analysis');
  }
  
  if (data.fastest_by_car) {
    result.availableFeatures.push('fastest_laps', 'fastest_sectors');
  }
  
  if (data.fastest_by_manufacturer) {
    result.availableFeatures.push('manufacturer_analysis');
  }
}

/**
 * Validate simple format data
 */
function validateSimpleFormat(data: any, result: DataValidationResult): void {
  if (data.race_strategy_by_car) {
    result.availableFeatures.push('race_strategy', 'pit_stops', 'anomalous_laps');
  }
  
  if (data.fastest_by_car) {
    result.availableFeatures.push('fastest_laps');
  }
  
  result.warnings.push('Simple format detected - some advanced features may not be available');
}

/**
 * Phase 4: Attempt partial validation when format is unknown
 */
function attemptPartialValidation(data: any, result: DataValidationResult): void {
  // Try to find any recognizable patterns
  const possibleFeatures: string[] = [];

  if (data.race_strategy_by_car) {
    possibleFeatures.push('Basic race strategy');
    result.availableFeatures.push('race_strategy');
  }

  if (data.fastest_by_car) {
    possibleFeatures.push('Fastest lap data');
    result.availableFeatures.push('fastest_laps');
  }

  if (data.enhanced_strategy_analysis) {
    possibleFeatures.push('Enhanced analysis');
    result.availableFeatures.push('enhanced_analysis');
  }

  if (possibleFeatures.length > 0) {
    result.warnings.push(`Partial data structure detected. Available: ${possibleFeatures.join(', ')}`);
    result.severity = 'moderate';
    result.fallbackOptions = ['Use available features only', 'Verify data completeness'];
    result.dataQuality = 'fair';
  }
}

/**
 * Phase 4: Calculate overall data quality metrics
 */
function calculateDataQuality(result: DataValidationResult): void {
  const totalFeatures = 10; // Expected number of features
  const availableFeatures = result.availableFeatures.length;
  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;

  // Calculate completeness percentage
  result.completeness = Math.round((availableFeatures / totalFeatures) * 100);

  // Determine data quality
  if (errorCount === 0 && warningCount === 0 && availableFeatures >= 8) {
    result.dataQuality = 'excellent';
    result.severity = 'info';
  } else if (errorCount === 0 && availableFeatures >= 6) {
    result.dataQuality = 'good';
    result.severity = 'minor';
  } else if (errorCount <= 2 && availableFeatures >= 4) {
    result.dataQuality = 'fair';
    result.severity = 'moderate';
  } else {
    result.dataQuality = 'poor';
    result.severity = 'critical';
  }

  // Add appropriate fallback options
  if (result.dataQuality === 'poor') {
    result.fallbackOptions = [
      'Load a different dataset',
      'Check data source integrity',
      'Contact data provider'
    ];
  } else if (result.dataQuality === 'fair') {
    result.fallbackOptions = [
      'Some features may be limited',
      'Verify data completeness',
      'Use available features'
    ];
  }
}

/**
 * Safely get car information with fallbacks
 */
export function getCarInfoSafely(data: any, carNumber: string): any {
  try {
    if (!data || !carNumber) return null;

    // Try to find car in race strategy data
    if (data.race_strategy_by_car) {
      const car = data.race_strategy_by_car.find((c: any) => c.car_number === carNumber);
      if (car) return car;
    }

    // Try enhanced analysis
    if (data.enhanced_strategy_analysis) {
      const car = data.enhanced_strategy_analysis.find((c: any) => c.car_number === carNumber);
      if (car) return car;
    }

    // Try fastest lap data
    if (data.fastest_by_car) {
      const car = data.fastest_by_car.find((c: any) => c.car_number === carNumber);
      if (car) return car;
    }

    return null;
  } catch (error) {
    console.warn(`Error getting car info for ${carNumber}:`, error);
    return null;
  }
}

/**
 * Validate individual event data with fallbacks
 */
export function validateEventData(event: any, type: string): boolean {
  try {
    if (!event) return false;

    switch (type) {
      case 'pit_stop':
        return !!(event.lap_number_entry && event.stationary_time);
      case 'driver_change':
        return !!(event.lap_number && event.from_driver && event.to_driver);
      case 'fastest_lap':
        return !!(event.lap_number && event.time);
      case 'fastest_sector':
        return !!(event.lap_number && event.sector && event.time);
      default:
        return true;
    }
  } catch (error) {
    console.warn(`Error validating ${type} event:`, error);
    return false;
  }
}
