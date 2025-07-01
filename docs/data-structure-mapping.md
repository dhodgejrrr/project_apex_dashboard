# Data Structure Mapping Documentation - Phase 1

## Overview
This document provides comprehensive mapping of the race_analysis.json data structure and how it integrates with the Timeline Event system.

## Data Formats Supported

### 1. Comprehensive Format (impc_watkins_2025)
This format contains detailed race strategy, pit stop analysis, and driver performance data.

#### Key Structure:
```json
{
  "fastest_by_car_number": [...],
  "fastest_by_manufacturer": [...],
  "race_strategy_by_car": [...],
  "enhanced_strategy_analysis": [...],
  "traffic_management_analysis": [...],
  "earliest_fastest_lap_drivers": [...],
  "full_pit_cycle_analysis": [...],
  "social_media_highlights": {...}
}
```

#### Timeline Event Mapping:
- **Race Start Events**: Derived from `race_strategy_by_car[].stints[0]` and `driver_change_details`
- **Pit Stop Events**: Direct mapping from `race_strategy_by_car[].pit_stop_details[]`
- **Driver Change Events**: Direct mapping from `race_strategy_by_car[].driver_change_details[]`
- **Fastest Lap Events**: Direct mapping from `earliest_fastest_lap_drivers[]`
- **Fastest Sector Events**: Derived from `fastest_by_car_number[].best_s1/s2/s3`
- **Anomalous Lap Events**: Calculated from `race_strategy_by_car[].stints[].laps[]`

### 2. Simple Format (test_race)
This format contains basic race results with minimal timing data.

#### Key Structure:
```json
{
  "race_name": "Monaco Grand Prix 2024",
  "circuit": "Circuit de Monaco",
  "date": "2024-05-26",
  "weather": "Sunny, 24°C",
  "fastest_by_car_number": [...],
  "sector_analysis": {...},
  "pit_stops": [...]
}
```

#### Timeline Event Mapping:
- **Race Start Events**: Derived from `fastest_by_car_number[]` (starting drivers)
- **Pit Stop Events**: Direct mapping from `pit_stops[]`
- **Driver Change Events**: Not available in simple format
- **Fastest Lap Events**: Derived from `fastest_by_car_number[].fastest_lap`
- **Fastest Sector Events**: Derived from `sector_analysis` (global fastest, not per-car)
- **Anomalous Lap Events**: Not available in simple format

## Timeline Event Types

### 1. Race Start Events
**Purpose**: Show which driver starts in each car

**Comprehensive Format Extraction**:
```typescript
// Source: race_strategy_by_car[].stints[0] + driver_change_details
const startingDriver = car.driver_change_details.length > 0 
  ? car.driver_change_details[0].from_driver 
  : fallbackFromFastestLap;
```

**Simple Format Extraction**:
```typescript
// Source: fastest_by_car_number[].driver
const startingDriver = car.driver || car.driver_name;
```

### 2. Pit Stop Events
**Purpose**: Show all pit stops with timing and details

**Comprehensive Format Extraction**:
```typescript
// Source: race_strategy_by_car[].pit_stop_details[]
{
  lap: pitStop.lap_number_entry,
  time: pitStop.total_pit_lane_time,
  stationaryTime: pitStop.stationary_time,
  driverChange: pitStop.driver_change
}
```

**Simple Format Extraction**:
```typescript
// Source: pit_stops[]
{
  lap: pitStop.lap,
  time: pitStop.duration,
  tireChange: pitStop.tire_change
}
```

### 3. Driver Change Events
**Purpose**: Show driver changes with from/to information

**Availability**: Only in comprehensive format
```typescript
// Source: race_strategy_by_car[].driver_change_details[]
{
  lap: change.lap_number,
  fromDriver: change.from_driver,
  toDriver: change.to_driver
}
```

### 4. Fastest Lap Events
**Purpose**: Show fastest lap achieved by each driver in each car

**Comprehensive Format Extraction**:
```typescript
// Source: earliest_fastest_lap_drivers[]
{
  lap: fastestLap.lap_number_race,
  time: fastestLap.fastest_lap_time,
  driver: fastestLap.driver_name,
  stintId: fastestLap.stint_id
}
```

**Simple Format Extraction**:
```typescript
// Source: fastest_by_car_number[].fastest_lap
{
  lap: car.fastest_lap.lap_number,
  time: car.fastest_lap.time,
  driver: car.fastest_lap.driver_name
}
```

### 5. Fastest Sector Events
**Purpose**: Show fastest sector times (S1, S2, S3) for each driver/car

**Both Formats**:
```typescript
// Source: fastest_by_car_number[].best_s1/s2/s3
{
  sector: 1|2|3,
  lap: car.best_s1.lap_number,
  time: car.best_s1.time,
  driver: car.best_s1.driver_name
}
```

### 6. Anomalous Lap Events
**Purpose**: Show laps that exceed threshold percentage over typical pace

**Availability**: Only in comprehensive format
**Logic**:
```typescript
// Source: race_strategy_by_car[].stints[].laps[]
1. Calculate median lap time per stint (clean laps only)
2. Set threshold (default 5% above median)
3. Flag laps exceeding threshold
4. Exclude yellow flag laps
5. Determine suspected cause based on deviation severity
```

## Data Completeness Handling

### Missing Data Scenarios:
1. **Empty race_analysis.json**: Return empty arrays, show "No data available"
2. **Partial data**: Graceful degradation, show available events only
3. **Malformed data**: Validation errors, clear error messages
4. **Mixed formats**: Auto-detect format, use appropriate extraction logic

### Fallback Strategies:
- Missing driver names: Use "Unknown Driver"
- Missing team info: Use "Unknown Team"
- Missing manufacturer: Use "Unknown" or derive from team
- Missing lap numbers: Use stint position or array index
- Missing times: Use "Unknown" or calculate from available data

## Performance Considerations

### Large Dataset Handling:
- Lazy loading of detailed event data
- Memoization of expensive calculations (median lap times)
- Debounced car selection changes
- Virtual scrolling for large timeline datasets

### Memory Optimization:
- Extract only necessary fields for timeline display
- Cache calculation results
- Avoid duplicate data storage
- Clean up unused event objects

## Error Handling

### Validation Levels:
1. **Critical Errors**: Malformed JSON, missing core structure
2. **Warnings**: Missing optional fields, incomplete data
3. **Info**: Available features, data format detected

### Recovery Strategies:
- Try alternative data sources within same file
- Provide meaningful error messages
- Offer retry mechanisms
- Graceful degradation with limited functionality

## Integration Points

### With DataContext:
- Race data provided via `useData()` hook
- Automatic re-extraction on data changes
- Consistent data format across components

### With UI Components:
- TimelineEvent interface standardizes all event types
- Consistent sorting and filtering across event types
- Extensible event detail structure

### With Validation:
- Pre-flight validation before extraction
- Feature availability checks
- Clear feedback on data limitations

## Testing Scenarios

### Data Formats:
- ✅ Comprehensive format (impc_watkins_2025)
- ✅ Simple format (test_race)
- ✅ Empty/null data
- ✅ Malformed JSON
- ✅ Mixed/hybrid formats

### Event Types:
- ✅ All cars have race start events
- ✅ Pit stops extracted correctly
- ✅ Driver changes (when available)
- ✅ Fastest laps per car/driver
- ✅ Fastest sectors per car/driver
- ✅ Anomalous lap detection

### Edge Cases:
- ✅ Cars with no events (DNS/DNF)
- ✅ Incomplete stint data
- ✅ Missing sector times
- ✅ Driver changes without pit stops
- ✅ Different stint structures

## Future Enhancements

### Potential Additions:
1. **Yellow Flag Events**: Extract from flag data when available
2. **Penalty Events**: From steward decisions data
3. **Overtaking Events**: From position change analysis
4. **Tire Strategy Events**: From tire compound changes
5. **Weather Events**: From weather condition changes

### Data Structure Evolution:
- Support for additional data formats
- Backward compatibility maintenance
- Migration utilities for format changes
- Extended validation rules
