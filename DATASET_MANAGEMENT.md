# Enhanced Dataset Management System

This update introduces a comprehensive dataset management system that properly handles both pre-loaded datasets and user-uploaded files, providing a unified interface for dataset access and management throughout the application.

## Key Features

### 1. **Unified Dataset Management**
- **Pre-loaded Datasets**: Sample datasets stored in `public/data_sets/` for quick testing and demonstration
- **User-uploaded Datasets**: Files uploaded by users, stored in browser localStorage with full validation
- **Seamless Integration**: Both dataset types use the same interface and provide identical functionality

### 2. **Robust Dataset Discovery**
- **Automatic Scanning**: Pre-loaded datasets are automatically discovered and validated on startup
- **Dynamic Loading**: Datasets are loaded on-demand with proper error handling and validation
- **Metadata Management**: Rich metadata tracking for both dataset types including creation dates, sources, and descriptions

### 3. **Enhanced File Validation**
- **Schema Validation**: Comprehensive validation for race analysis, insights, and social media data
- **File Type Checking**: Ensures only valid JSON files are accepted
- **Size Limits**: Prevents oversized uploads (10MB limit)
- **Content Validation**: Validates data structure and required fields

### 4. **Improved User Experience**
- **Visual Indicators**: Clear badges showing dataset source (Sample/Uploaded) and available data types
- **Loading States**: Proper loading indicators for all dataset operations
- **Error Handling**: Comprehensive error messages with actionable feedback
- **Dataset Deletion**: Users can delete their uploaded datasets with confirmation

## System Architecture

### Core Components

#### 1. **Dataset Types** (`types/dataset-types.ts`)
Defines the complete type system for dataset management:
- `Dataset`: Main dataset interface with metadata and files
- `DatasetMetadata`: Rich metadata including source, dates, and tags
- `DatasetFile`: Individual file information with path and metadata
- `DatasetManager`: Interface for all dataset operations

#### 2. **Dataset Manager** (`utils/dataset-manager.ts`)
Centralized service for all dataset operations:
- **Discovery**: Scans both pre-loaded and uploaded datasets
- **Loading**: Handles dataset loading with proper error handling
- **Validation**: Comprehensive validation for datasets and files
- **Storage**: Manages localStorage for uploaded datasets
- **Deletion**: Safe deletion of user datasets

#### 3. **Enhanced Data Context** (`contexts/DataContext.tsx`)
Updated context providing:
- **Dataset State**: Current dataset, available datasets, loading states
- **Dataset Operations**: Load, upload, delete, and refresh operations
- **Error Management**: Comprehensive error handling for all dataset operations
- **Legacy Support**: Maintains compatibility with existing components

#### 4. **Updated Components**

**DatasetSelector** (`components/DatasetSelector.tsx`):
- Modern dropdown interface for dataset selection
- Visual indicators for dataset types and available data
- Delete functionality for uploaded datasets
- Loading and error states

**EnhancedFileUploader** (`components/EnhancedFileUploader.tsx`):
- Simplified upload process using the dataset management system
- Automatic dataset creation and loading after upload
- Improved error handling and user feedback

## Usage Guide

### For Pre-loaded Datasets

1. **Adding New Datasets**:
   ```
   /public/data_sets/your_dataset_name/
   ├── race_analysis.json (required for complete datasets)
   ├── insights.json (optional)
   └── social.json (optional)
   ```

2. **Registration**: Add the dataset name to `KNOWN_PRELOADED_DATASETS` in `dataset-manager.ts`

3. **Access**: Datasets appear automatically in the selector with "Sample" badges

### For User Uploads

1. **Upload Process**: Users drag & drop or select JSON files
2. **Validation**: Files are validated for structure and content
3. **Storage**: Valid datasets are stored in localStorage with metadata
4. **Access**: Uploaded datasets appear with "Uploaded" badges and delete options

### Integration with Visualization

Once a dataset is selected (either pre-loaded or uploaded):
1. **Data Loading**: All available files (race, insights, social) are loaded automatically
2. **Context Update**: Data is available throughout the app via `useData()` hook
3. **Dashboard Access**: Users can navigate to visualization dashboards
4. **Consistent Experience**: No difference in functionality between dataset types

## API Reference

### Dataset Manager Methods

```typescript
// Get all available datasets
const datasets = await datasetManager.getAllDatasets();

// Load a specific dataset
const result = await datasetManager.loadDataset(datasetId);

// Upload user files
const uploadResult = await datasetManager.uploadFiles(files);

// Validate dataset
const validation = await datasetManager.validateDataset(dataset);

// Delete dataset (uploaded only)
const success = await datasetManager.deleteDataset(datasetId);
```

### Data Context Hooks

```typescript
const {
  // Current state
  currentDataset,
  availableDatasets,
  isLoadingDatasets,
  datasetError,
  
  // Operations
  loadDatasetById,
  refreshAvailableDatasets,
  uploadFiles,
  deleteDataset,
  
  // Data access (unchanged)
  raceData,
  insightsData,
  socialMediaData,
  hasRaceData
} = useData();
```

## Migration Notes

### For Existing Components
- **Data Access**: No changes needed - `raceData`, `insightsData`, `socialMediaData` work as before
- **Loading States**: Use `isAnyLoading()` which now includes dataset loading
- **Error Handling**: Use `hasAnyError()` and `getAllErrors()` for comprehensive error information

### For New Development
- **Use Dataset Context**: Prefer the new dataset management functions for loading data
- **Handle Both Sources**: Design components to work with both pre-loaded and uploaded datasets
- **Validate Early**: Use the validation functions to provide better user feedback

## Benefits

1. **Improved UX**: Users can easily switch between sample data and their own files
2. **Better Organization**: Clear separation between sample and user data
3. **Enhanced Validation**: Comprehensive validation prevents broken states
4. **Scalability**: Easy to add new pre-loaded datasets or enhance validation
5. **Maintainability**: Centralized dataset management reduces code duplication

## Technical Implementation

### Pre-loaded Dataset Loading
1. **Discovery**: Scan known dataset names for available files
2. **Validation**: Check file existence via HTTP HEAD requests
3. **Loading**: Fetch files via standard HTTP requests
4. **Caching**: Leverage browser caching for performance

### Uploaded Dataset Handling
1. **File Reading**: Use FileReader API for client-side file processing
2. **Validation**: Comprehensive JSON parsing and schema validation
3. **Storage**: Store in localStorage with metadata and raw content
4. **Retrieval**: Load from localStorage with proper error handling

### Error Recovery
- **Graceful Degradation**: System continues to work even if some datasets fail to load
- **Clear Feedback**: Specific error messages help users understand and resolve issues
- **Retry Mechanisms**: Users can refresh datasets to retry failed operations

This enhanced dataset management system provides a robust foundation for handling both sample and user data while maintaining a consistent and intuitive user experience.
