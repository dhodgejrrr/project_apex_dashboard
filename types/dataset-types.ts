// Enhanced dataset management types

export interface DatasetFile {
  name: string;
  path: string;
  size?: number;
  lastModified?: Date;
  isPreloaded: boolean;
}

export interface DatasetMetadata {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  source: 'preloaded' | 'uploaded';
  createdAt: Date;
  updatedAt: Date;
  version?: string;
  tags?: string[];
}

export interface DatasetFiles {
  raceAnalysis?: DatasetFile;
  insights?: DatasetFile;
  social?: DatasetFile;
}

export interface Dataset {
  metadata: DatasetMetadata;
  files: DatasetFiles;
  isComplete: boolean;
  hasRaceAnalysis: boolean;
  hasInsights: boolean;
  hasSocial: boolean;
}

export interface DatasetLoadResult {
  success: boolean;
  dataset?: Dataset;
  errors: string[];
  warnings: string[];
}

export interface DatasetValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileValidations: {
    raceAnalysis?: { isValid: boolean; errors: string[] };
    insights?: { isValid: boolean; errors: string[] };
    social?: { isValid: boolean; errors: string[] };
  };
}

export interface DatasetManager {
  // Dataset discovery
  scanPreloadedDatasets(): Promise<Dataset[]>;
  scanUploadedDatasets(): Promise<Dataset[]>;
  getAllDatasets(): Promise<Dataset[]>;
  
  // Dataset operations
  loadDataset(datasetId: string): Promise<DatasetLoadResult>;
  validateDataset(dataset: Dataset): Promise<DatasetValidationResult>;
  deleteDataset(datasetId: string): Promise<boolean>;
  
  // File operations
  uploadFiles(files: { [key: string]: File }): Promise<DatasetLoadResult>;
  validateFiles(files: { [key: string]: File }): Promise<DatasetValidationResult>;
  
  // Metadata operations
  updateDatasetMetadata(datasetId: string, metadata: Partial<DatasetMetadata>): Promise<void>;
  getDatasetMetadata(datasetId: string): Promise<DatasetMetadata | null>;
}

export type DatasetSource = 'preloaded' | 'uploaded';
export type DatasetFileType = 'raceAnalysis' | 'insights' | 'social';
