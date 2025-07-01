Phase 1: Data Integration & Structure Analysis
Objective: Ensure complete understanding and proper integration of race_analysis.json data structure

Prompt for AI Implementation:
PHASE 1: Data Integration & Structure Analysis

CONTEXT: 
You are working on a React TypeScript racing dashboard. The RaceTimelineDashboard component needs to be completely rebuilt to properly integrate with the race_analysis.json data structure. 

FILES TO ANALYZE:
- /Users/davidhodge/Documents/GitHub/project_apex_dashboard/public/data_sets/impc_watkins_2025/race_analysis.json
- /Users/davidhodge/Documents/GitHub/project_apex_dashboard/public/data_sets/test_race/race_analysis.json  
- /Users/davidhodge/Documents/GitHub/project_apex_dashboard/types/race-data.ts

TASKS:
1. Analyze the complete structure of both race_analysis.json files
2. Create comprehensive TypeScript interfaces that match the actual data structure
3. Update race-data.ts types to include missing interfaces for:
   - Anomalous lap detection data
   - Race start lineup data  
   - Complete sector timing data with lap numbers
   - Driver change timeline events
   - Yellow flag identification data
4. Create utility functions to extract timeline events from the data:
   - extractRaceStartEvents() - who starts in each car
   - extractPitStopEvents() - all pit stops with timing
   - extractDriverChangeEvents() - all driver changes
   - extractFastestLapEvents() - fastest lap for each driver/car combination  
   - extractFastestSectorEvents() - fastest sector times for each driver/car
   - extractAnomalousLapEvents() - laps above threshold (exclude YF laps)

DELIVERABLES:
- Updated TypeScript interfaces in race-data.ts
- New utility file: utils/timeline-event-extractor.ts with all extraction functions
- Data validation functions to ensure data completeness
- Documentation of data structure mapping

REQUIREMENTS:
- All functions must handle both data formats (test_race and impc_watkins_2025)
- Include comprehensive error handling and data validation
- Add TypeScript strict typing throughout
- Functions should return consistent TimelineEvent interface structures



Phase 2: UI Component Redesign
Objective: Replace checkbox-based car selection with proper dropdown and improve visual design

Prompt for AI Implementation:
PHASE 2: UI Component Redesign

CONTEXT:
Building on Phase 1, you need to completely redesign the car selection UI and overall timeline layout for the RaceTimelineDashboard component.

REQUIREMENTS FROM SPEC:
- Single dropdown UI that shows "Select a car" initially
- When opened, shows ALL cars with: car numbers, driver names, and manufacturer
- Once a car is selected, show ALL race events for that car (no filtering options)
- Modern, clean design consistent with existing dashboard components

REFERENCE COMPONENTS:
- /Users/davidhodge/Documents/GitHub/project_apex_dashboard/components/DatasetSelector.tsx (for dropdown pattern)
- /Users/davidhodge/Documents/GitHub/project_apex_dashboard/views/Dashboard.tsx (for design consistency)

TASKS:
1. Create a new CarSelectorDropdown component:
   - Single-select dropdown (not multi-select)
   - Display format: "#[NUMBER] [DRIVER] ([MANUFACTURER])"
   - Modern styling with proper hover/focus states
   - Search/filter capability within dropdown
2. Remove all existing filtering UI (event type filters, multi-car selection)
3. Redesign timeline layout:
   - Better visual hierarchy for different event types
   - Improved icons and color coding for each event type
   - Better spacing and typography
   - Add manufacturer badges/indicators
4. Create timeline event cards with:
   - Lap number prominence
   - Event type icons with proper color coding  
   - Driver information clearly displayed
   - Time/duration information
   - Additional details in expandable/tooltip format

DELIVERABLES:
- New component: components/CarSelectorDropdown.tsx
- Updated RaceTimelineDashboard.tsx with new UI structure
- Enhanced styling and visual design
- Responsive design for mobile/desktop

REQUIREMENTS:
- Must integrate with Phase 1 data extraction functions
- Consistent with existing design system
- Proper TypeScript typing
- Accessible UI components (ARIA labels, keyboard navigation)


Phase 3: Complete Timeline Event Integration
Objective: Integrate all timeline events including fastest laps, sectors, and anomalous laps

Prompt for AI Implementation:
PHASE 3: Complete Timeline Event Integration  

CONTEXT:
Using the data extraction functions from Phase 1 and UI components from Phase 2, implement the complete timeline functionality that shows ALL race events for a selected car.

EVENT TYPES TO IMPLEMENT:
1. Race Start - which driver starts in the selected car
2. Pit Stops - all pit stop events with timing and details
3. Driver Changes - all driver changes with from/to information
4. Fastest Laps - fastest lap achieved by each driver in the car
5. Fastest Sectors - fastest sector times (S1, S2, S3) for each driver in the car  
6. Anomalous Laps - laps that exceed threshold percentage over typical pace (exclude yellow flags)

ANOMALOUS LAP LOGIC:
- Calculate median lap time for each driver in clean conditions (no yellow flags)
- Flag laps that are >5% slower than driver's median (configurable threshold)
- Exclude laps marked with yellow flag indicators
- Show reason indicators (overtaken, mistake, traffic, etc.)

TASKS:
1. Implement complete event aggregation:
   - Use Phase 1 extraction functions to gather all events for selected car
   - Sort chronologically by lap number
   - Handle multiple events per lap properly
2. Add comprehensive event display:
   - Race start with starting driver
   - All pit stops with stationary time, total time, tire changes
   - Driver changes with clear from/to indicators
   - Fastest lap achievements with sector breakdown
   - Fastest sector achievements (separate events for S1, S2, S3)
   - Anomalous laps with deviation percentage and suspected cause
3. Implement anomalous lap detection:
   - Median calculation per driver
   - Threshold-based detection (default 5%, configurable)
   - Yellow flag exclusion logic
   - Cause analysis (traffic, pace drop, etc.)
4. Enhanced event details:
   - Expandable/collapsible details for complex events
   - Sector time breakdowns for fastest laps
   - Pit stop strategy information
   - Anomaly analysis details

DELIVERABLES:
- Complete timeline event integration in RaceTimelineDashboard.tsx
- Anomalous lap detection utility functions
- Enhanced event detail components
- Configuration options for anomaly thresholds

REQUIREMENTS:
- All events must be sourced from race_analysis.json data
- Handle edge cases (missing data, incomplete stints, etc.)
- Performance optimized for large datasets
- Clear visual distinction between event types


Phase 4: Data Validation & Edge Case Handling
Objective: Ensure robust handling of all data scenarios and edge cases

Prompt for AI Implementation:
PHASE 4: Data Validation & Edge Case Handling

CONTEXT:
Complete the RaceTimelineDashboard implementation by adding comprehensive data validation, error handling, and edge case management.

EDGE CASES TO HANDLE:
1. Missing or incomplete data in race_analysis.json
2. Cars with no events (DNS, DNF scenarios)  
3. Incomplete stint data or missing lap times
4. Driver changes without corresponding pit stops
5. Fast laps without sector time data
6. Different data structures between datasets

TASKS:
1. Add comprehensive data validation:
   - Validate race_analysis.json structure before processing
   - Check for required fields and data completeness
   - Graceful degradation when data is missing
   - Clear error messages for data issues
2. Implement fallback behaviors:
   - Show "No events found" state when car has no timeline data
   - Handle partial data gracefully (e.g., fastest lap without sectors)
   - Default values for missing manufacturer information
   - Fallback event descriptions when details are unavailable
3. Add loading states and error boundaries:
   - Loading spinners during data processing
   - Error boundaries for component crashes
   - Retry mechanisms for data loading failures
   - Clear user feedback for all states
4. Performance optimization:
   - Memoization of expensive calculations
   - Lazy loading of detailed event data
   - Debounced car selection changes
   - Virtual scrolling for large timeline datasets
5. Testing scenarios:
   - Test with both available datasets (test_race and impc_watkins_2025)
   - Test with partial/corrupted data scenarios
   - Test performance with large datasets
   - Test responsive behavior across devices

DELIVERABLES:
- Comprehensive error handling throughout the component
- Loading states and error boundaries
- Performance optimizations implemented
- Fallback UI components for edge cases
- Data validation utility functions

REQUIREMENTS:
- Must work seamlessly with both existing datasets
- Graceful degradation in all scenarios
- Clear user feedback for all states
- Production-ready error handling
- Performance suitable for large racing datasets

FINAL VALIDATION:
After implementation, verify that the component meets original spec:
✓ Dropdown UI showing all cars with numbers and manufacturers
✓ Selected car shows ALL race events without filtering
✓ Displays fast laps and sectors for each driver
✓ Shows anomalous laps with threshold detection
✓ Complete pit stop and driver change timeline
✓ Race start information displayed
✓ Uses race_analysis.json as source of truth


Phase 5: Final Integration & Testing
Objective: Complete testing, polish, and integration with the broader dashboard

Prompt for AI Implementation:
PHASE 5: Final Integration & Testing

CONTEXT:
Complete the RaceTimelineDashboard implementation with final integration testing, visual polish, and seamless integration with the existing dashboard navigation and data management system.

INTEGRATION POINTS:
- Navigation.tsx menu integration
- DataContext.tsx state management
- Theme system integration (ThemeContext.tsx)
- Consistent styling with other dashboard views

TASKS:
1. Final integration testing:
   - Test navigation from main menu to Race Timeline
   - Verify data context integration works properly
   - Test dataset switching behavior
   - Confirm theme consistency (light/dark mode)
2. Visual polish and consistency:
   - Ensure consistent styling with other dashboard views
   - Proper spacing, typography, and color schemes
   - Icons and visual elements match dashboard design
   - Mobile responsive design verification
3. Performance and UX improvements:
   - Smooth animations and transitions
   - Proper loading states throughout
   - Keyboard navigation support
   - Screen reader accessibility
4. Documentation and code cleanup:
   - Add comprehensive code comments
   - Clean up unused imports and variables
   - Optimize bundle size
   - Add JSDoc comments for complex functions
5. Final validation against original specification:
   - ✓ Dropdown UI with car numbers and manufacturers
   - ✓ All race events displayed when car selected
   - ✓ Fastest laps and sectors shown
   - ✓ Anomalous lap detection working
   - ✓ Complete timeline from race_analysis.json
   - ✓ No gaps in functionality from original spec

DELIVERABLES:
- Fully integrated and tested RaceTimelineDashboard component
- Updated navigation and routing (if needed)
- Performance optimizations applied
- Comprehensive code documentation
- Final verification checklist completed

REQUIREMENTS:
- Production-ready code quality
- Full accessibility compliance
- Cross-browser compatibility
- Mobile-first responsive design
- Comprehensive error handling maintained

SUCCESS CRITERIA:
The Race Timeline dashboard should provide a comprehensive, single-car focused view of all race events sourced entirely from race_analysis.json data, with intuitive dropdown selection and complete timeline visualization of race progression including pit stops, driver changes, fastest achievements, and anomalous events.