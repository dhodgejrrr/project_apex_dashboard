// Core racing data type definitions
export interface FastestLapData {
  time: string;
  driver_name: string;
  lap_number: number;
}

export interface SectorTime {
  time: string;
  driver_name: string;
  lap_number: number;
}

export interface FastestByCar {
  car_number: string;
  fastest_lap: FastestLapData;
  best_s1: SectorTime;
  best_s2: SectorTime;
  best_s3: SectorTime;
  optimal_lap_time: string;
}

export interface FastestByManufacturer {
  manufacturer: string;
  fastest_lap: FastestLapData & { team: string; car_number: string };
  best_s1: SectorTime & { team: string; car_number: string };
  best_s2: SectorTime & { team: string; car_number: string };
  best_s3: SectorTime & { team: string; car_number: string };
  optimal_lap_time: string;
}

export interface LapData {
  lap_in_stint: number;
  LAP_TIME_FUEL_CORRECTED_SEC: number;
}

export interface StintData {
  stint_number: number;
  total_laps: number;
  total_time: string;
  green_laps: number;
  yellow_laps: number;
  red_laps: number;
  other_laps: number;
  avg_green_time_formatted?: string;
  best_green_time_formatted?: string;
  avg_yellow_time_formatted?: string;
  lap_range: string;
  best_5_lap_avg: string | null;
  traffic_in_class_laps: number;
  traffic_out_of_class_laps: number;
  laps: LapData[];
}

export interface PitStopDetail {
  stop_number: number;
  lap_number_entry: number;
  total_pit_lane_time: string;
  stationary_time: string;
  driver_change: boolean;
}

export interface DriverChangeDetail {
  lap_number: number;
  from_driver: string;
  to_driver: string;
}

export interface RaceStrategyByCar {
  car_number: string;
  total_pit_time: string;
  average_pit_time: string;
  total_pit_time_minus_travel: string;
  total_pit_stops: number;
  total_driver_changes: number;
  driver_change_details: DriverChangeDetail[];
  stints: StintData[];
  pit_stop_details: PitStopDetail[];
}

export interface TireDegradationModel {
  deg_coeff_a: number;
  deg_coeff_b: number;
  deg_coeff_c: number;
  fastest_lap_of_stint_predicted_at: number;
  model_quality: string;
  total_clean_laps_used: number;
  end_of_stint_deg_rate_s_per_lap: number;
  predicted_final_5_laps_loss_s: number;
}

export interface EnhancedStrategyAnalysis {
  car_number: string;
  team: string;
  manufacturer: string;
  avg_green_pace_fuel_corrected: string;
  race_pace_consistency_stdev: number;
  avg_pit_stationary_time: string;
  tire_degradation_model: TireDegradationModel;
}

export interface DriverPerformance {
  driver_name: string;
  driver_number: string;
  best_lap_time: string;
  best_s1: string;
  best_s2: string;
  best_s3: string;
}

export interface DriverDelta {
  driver_name: string;
  lap_time_delta: string;
  s1_delta: string;
  s2_delta: string;
  s3_delta: string;
}

export interface DriverDeltasByCar {
  car_number: string;
  drivers_performance: DriverPerformance[];
  fastest_driver_name: string;
  deltas_to_fastest: DriverDelta[];
  average_lap_time_delta_for_car: string;
}

export interface TrafficManagementAnalysis {
  rank: number;
  driver_name: string;
  car_number: string;
  team: string;
  total_traffic_laps: number;
  in_class_traffic_laps: number;
  out_of_class_traffic_laps: number;
}

export interface EarliestFastestLap {
  rank: number;
  driver_name: string;
  car_number: string;
  team: string;
  lap_in_stint: number;
  stint_id: string;
  lap_number_race: number;
  fastest_lap_time: string;
}

export interface PitCycleAnalysis {
  rank: number;
  car_number: string;
  team: string;
  average_cycle_loss: number;
  number_of_stops_analyzed: number;
}

export interface MetronomeAward {
  driver_name: string;
  car_number: string;
  team: string;
  consistency_stdev: number;
  start_lap: number;
  end_lap: number;
  times: string[];
}

export interface PerfectLapRanking {
  rank: number;
  car_number: string;
  driver_name: string;
  perfection_pct: string;
  fastest_lap_time: string;
  optimal_lap_time: string;
}

export interface ManufacturerShowdown {
  rank: number;
  manufacturer: string;
  car_number: string;
  team: string;
  stint_details: {
    stint_number: number;
    lap_count: number;
  };
}

export interface SocialMediaHighlights {
  metronome_award: {
    lap_time: MetronomeAward;
    sector_1: MetronomeAward;
    sector_2: MetronomeAward;
    sector_3: MetronomeAward;
  };
  metronome_award_longer: {
    lap_time: MetronomeAward;
    sector_1: MetronomeAward;
    sector_2: MetronomeAward;
    sector_3: MetronomeAward;
  };
  perfect_lap_ranking: PerfectLapRanking[];
  manufacturer_showdown: ManufacturerShowdown[];
}

// Main race data interface
export interface RaceData {
  fastest_by_car_number: FastestByCar[];
  fastest_by_manufacturer: FastestByManufacturer[];
  longest_stints_by_manufacturer: any[];
  driver_deltas_by_car: DriverDeltasByCar[];
  manufacturer_driver_pace_gap: any;
  race_strategy_by_car: RaceStrategyByCar[];
  enhanced_strategy_analysis: EnhancedStrategyAnalysis[];
  traffic_management_analysis: TrafficManagementAnalysis[];
  earliest_fastest_lap_drivers: EarliestFastestLap[];
  full_pit_cycle_analysis: PitCycleAnalysis[];
  social_media_highlights: SocialMediaHighlights;
  metadata: {
    analysis_type: string;
  };
}

// New interfaces for insights data
export interface InsightsData {
  executive_summary: string;
  marketing_angles: string[];
}

// New interfaces for social media data
export interface SocialMediaPost {
  text: string;
  needs_visual: boolean;
  visual_type: string | null;
  visual_params: Record<string, any> | null;
  priority: 'high' | 'medium' | 'low';
  has_visual: boolean;
  image_url?: string;
}

export interface SocialMediaData {
  posts: SocialMediaPost[];
  metadata: {
    generation_method: string;
    attempts: number;
    final_critique: {
      approved: boolean;
      feedback: string;
    };
    warning: string | null;
  };
}

// Utility types for data relationships
export interface DataRelationship {
  type: 'car' | 'driver' | 'manufacturer' | 'team';
  identifier: string;
  confidence: number;
}

export interface CrossReference {
  sourceType: 'insights' | 'social' | 'race';
  sourceId: string;
  targetType: 'insights' | 'social' | 'race';
  targetId: string;
  relationship: DataRelationship;
}