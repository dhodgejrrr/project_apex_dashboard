import { 
  Dataset, 
  DatasetFile, 
  DatasetMetadata, 
  DatasetLoadResult, 
  DatasetValidationResult,
  DatasetManager as IDatasetManager,
  DatasetFileType
} from '../types/dataset-types';

class DatasetManager implements IDatasetManager {
  private readonly PRELOADED_BASE_PATH = '/data_sets';
  private readonly STORAGE_KEY = 'apex_dashboard_datasets';
  
  // Known preloaded datasets
  private readonly KNOWN_PRELOADED_DATASETS = [
    'impc_watkins_2025',
    'test_race'
  ];

  async scanPreloadedDatasets(): Promise<Dataset[]> {
    console.log('🔍 Scanning preloaded datasets...');
    const datasets: Dataset[] = [];

    for (const datasetName of this.KNOWN_PRELOADED_DATASETS) {
      try {
        console.log(`🔍 Checking dataset: ${datasetName}`);
        const basePath = `${this.PRELOADED_BASE_PATH}/${datasetName}`;
        const files = await this.scanDatasetFiles(basePath, true);
        
        console.log(`📁 Files found for ${datasetName}:`, files);
        
        if (this.hasAnyFiles(files)) {
          const metadata: DatasetMetadata = {
            id: `preloaded_${datasetName}`,
            name: datasetName,
            displayName: this.formatDatasetName(datasetName),
            description: `Pre-loaded dataset: ${this.formatDatasetName(datasetName)}`,
            source: 'preloaded',
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: ['preloaded', 'sample']
          };

          const dataset = {
            metadata,
            files,
            isComplete: !!files.raceAnalysis,
            hasRaceAnalysis: !!files.raceAnalysis,
            hasInsights: !!files.insights,
            hasSocial: !!files.social
          };

          console.log(`✅ Dataset created for ${datasetName}:`, dataset);
          datasets.push(dataset);
        } else {
          console.log(`❌ No files found for ${datasetName}`);
        }
      } catch (error) {
        console.warn(`❌ Failed to scan preloaded dataset ${datasetName}:`, error);
      }
    }

    console.log(`📊 Total preloaded datasets found: ${datasets.length}`, datasets);
    return datasets;
  }

  async scanUploadedDatasets(): Promise<Dataset[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const uploadedData = JSON.parse(stored);
      const datasets: Dataset[] = [];

      for (const [id, datasetData] of Object.entries(uploadedData)) {
        try {
          const dataset = this.deserializeDataset(id, datasetData as any);
          if (dataset) {
            datasets.push(dataset);
          }
        } catch (error) {
          console.warn(`Failed to deserialize uploaded dataset ${id}:`, error);
        }
      }

      return datasets;
    } catch (error) {
      console.error('Failed to scan uploaded datasets:', error);
      return [];
    }
  }

  async getAllDatasets(): Promise<Dataset[]> {
    const [preloaded, uploaded] = await Promise.all([
      this.scanPreloadedDatasets(),
      this.scanUploadedDatasets()
    ]);

    return [...preloaded, ...uploaded];
  }

  async loadDataset(datasetId: string): Promise<DatasetLoadResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      if (datasetId.startsWith('preloaded_')) {
        return await this.loadPreloadedDataset(datasetId, errors, warnings);
      } else {
        return await this.loadUploadedDataset(datasetId, errors, warnings);
      }
    } catch (error) {
      errors.push(`Failed to load dataset: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings };
    }
  }

  async validateDataset(dataset: Dataset): Promise<DatasetValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fileValidations: any = {};

    if (!dataset.metadata.name) {
      errors.push('Dataset name is required');
    }

    if (!dataset.metadata.source) {
      errors.push('Dataset source is required');
    }

    if (!this.hasAnyFiles(dataset.files)) {
      errors.push('Dataset must contain at least one data file');
    }

    if (!dataset.files.raceAnalysis && dataset.isComplete) {
      errors.push('Complete dataset must include race analysis data');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileValidations
    };
  }

  async deleteDataset(datasetId: string): Promise<boolean> {
    try {
      if (datasetId.startsWith('preloaded_')) {
        return false;
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        delete data[datasetId];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      }

      return true;
    } catch (error) {
      console.error(`Failed to delete dataset ${datasetId}:`, error);
      return false;
    }
  }

  async uploadFiles(files: { [key: string]: File }): Promise<DatasetLoadResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const validation = await this.validateFiles(files);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors, warnings: validation.warnings };
      }

      const datasetId = `uploaded_${Date.now()}`;
      const processedData: any = {};

      for (const [fileType, file] of Object.entries(files)) {
        try {
          const content = await this.readFileContent(file);
          const parsedData = JSON.parse(content);
          
          const fileValidation = await this.validateFileContent(parsedData, fileType as DatasetFileType);
          if (!fileValidation.isValid) {
            errors.push(...fileValidation.errors);
            continue;
          }

          processedData[fileType] = {
            content: parsedData,
            rawContent: content,
            file: {
              name: file.name,
              size: file.size,
              lastModified: new Date(file.lastModified),
              isPreloaded: false
            }
          };
        } catch (error) {
          errors.push(`Failed to process ${fileType} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (errors.length > 0) {
        return { success: false, errors, warnings };
      }

      const metadata: DatasetMetadata = {
        id: datasetId,
        name: `uploaded_${Date.now()}`,
        displayName: `Uploaded Dataset ${new Date().toLocaleDateString()}`,
        description: 'User uploaded dataset',
        source: 'uploaded',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['uploaded', 'user-data']
      };

      await this.storeUploadedDataset(datasetId, metadata, processedData);

      const dataset: Dataset = {
        metadata,
        files: this.createDatasetFiles(processedData),
        isComplete: !!processedData.raceAnalysis,
        hasRaceAnalysis: !!processedData.raceAnalysis,
        hasInsights: !!processedData.insights,
        hasSocial: !!processedData.social
      };

      return { success: true, dataset, errors, warnings };
    } catch (error) {
      errors.push(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings };
    }
  }

  async validateFiles(files: { [key: string]: File }): Promise<DatasetValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fileValidations: any = {};

    if (Object.keys(files).length === 0) {
      errors.push('At least one file must be provided');
    }

    for (const [fileType, file] of Object.entries(files)) {
      const validation = { isValid: true, errors: [] as string[] };

      if (!file.name.toLowerCase().endsWith('.json')) {
        validation.isValid = false;
        validation.errors.push(`${fileType} file must be a JSON file`);
      }

      if (file.size > 10 * 1024 * 1024) {
        validation.isValid = false;
        validation.errors.push(`${fileType} file is too large (max 10MB)`);
      }

      if (file.size === 0) {
        validation.isValid = false;
        validation.errors.push(`${fileType} file is empty`);
      }

      fileValidations[fileType] = validation;
    }

    Object.values(fileValidations).forEach((validation: any) => {
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileValidations
    };
  }

  async updateDatasetMetadata(datasetId: string, metadata: Partial<DatasetMetadata>): Promise<void> {
    if (datasetId.startsWith('preloaded_')) {
      throw new Error('Cannot update metadata for preloaded datasets');
    }

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data[datasetId]) {
        data[datasetId].metadata = { ...data[datasetId].metadata, ...metadata, updatedAt: new Date() };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      }
    }
  }

  async getDatasetMetadata(datasetId: string): Promise<DatasetMetadata | null> {
    const datasets = await this.getAllDatasets();
    const dataset = datasets.find(d => d.metadata.id === datasetId);
    return dataset?.metadata || null;
  }

  // Private helper methods
  private async scanDatasetFiles(basePath: string, isPreloaded: boolean): Promise<{ raceAnalysis?: DatasetFile; insights?: DatasetFile; social?: DatasetFile }> {
    console.log(`🔍 Scanning files in: ${basePath}`);
    const files: any = {};

    const fileChecks = [
      { type: 'raceAnalysis', filename: 'race_analysis.json' },
      { type: 'insights', filename: 'insights.json' },
      { type: 'social', filename: 'social.json' }
    ];

    for (const { type, filename } of fileChecks) {
      const filePath = `${basePath}/${filename}`;
      console.log(`🔍 Checking file: ${filePath}`);
      
      const exists = await this.checkFileExists(filePath);
      console.log(`📁 File ${filePath} exists: ${exists}`);
      
      if (exists) {
        files[type] = {
          name: filename,
          path: filePath,
          isPreloaded
        };
      }
    }

    console.log(`📊 Files found in ${basePath}:`, files);
    return files;
  }

  private async checkFileExists(path: string): Promise<boolean> {
    try {
      console.log(`🌐 Fetching HEAD for: ${path}`);
      const response = await fetch(path, { method: 'HEAD' });
      console.log(`📡 Response status: ${response.status} for ${path}`);
      return response.ok;
    } catch (error) {
      console.log(`❌ Error fetching ${path}:`, error);
      return false;
    }
  }

  private hasAnyFiles(files: { raceAnalysis?: DatasetFile; insights?: DatasetFile; social?: DatasetFile }): boolean {
    return !!(files.raceAnalysis || files.insights || files.social);
  }

  private formatDatasetName(name: string): string {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private async loadPreloadedDataset(datasetId: string, errors: string[], warnings: string[]): Promise<DatasetLoadResult> {
    const datasetName = datasetId.replace('preloaded_', '');
    
    const dataset = (await this.scanPreloadedDatasets()).find(d => d.metadata.id === datasetId);
    if (!dataset) {
      errors.push(`Preloaded dataset ${datasetName} not found`);
      return { success: false, errors, warnings };
    }

    return { success: true, dataset, errors, warnings };
  }

  private async loadUploadedDataset(datasetId: string, errors: string[], warnings: string[]): Promise<DatasetLoadResult> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      errors.push('No uploaded datasets found');
      return { success: false, errors, warnings };
    }

    const data = JSON.parse(stored);
    const datasetData = data[datasetId];
    if (!datasetData) {
      errors.push(`Uploaded dataset ${datasetId} not found`);
      return { success: false, errors, warnings };
    }

    const dataset = this.deserializeDataset(datasetId, datasetData);
    if (!dataset) {
      errors.push(`Failed to deserialize dataset ${datasetId}`);
      return { success: false, errors, warnings };
    }

    return { success: true, dataset, errors, warnings };
  }

  private async validateFileContent(content: any, fileType: DatasetFileType): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    switch (fileType) {
      case 'raceAnalysis':
        if (!content.fastest_by_car_number || !Array.isArray(content.fastest_by_car_number)) {
          errors.push('Race analysis must contain fastest_by_car_number array');
        }
        break;
      case 'insights':
        if (!content.executive_summary || typeof content.executive_summary !== 'string') {
          errors.push('Insights must contain executive_summary string');
        }
        if (!content.marketing_angles || !Array.isArray(content.marketing_angles)) {
          errors.push('Insights must contain marketing_angles array');
        }
        break;
      case 'social':
        if (!content.posts || !Array.isArray(content.posts)) {
          errors.push('Social media data must contain posts array');
        }
        break;
    }

    return { isValid: errors.length === 0, errors };
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private async storeUploadedDataset(datasetId: string, metadata: DatasetMetadata, processedData: any): Promise<void> {
    const stored = localStorage.getItem(this.STORAGE_KEY) || '{}';
    const data = JSON.parse(stored);
    
    data[datasetId] = {
      metadata,
      data: processedData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private deserializeDataset(id: string, data: any): Dataset | null {
    try {
      return {
        metadata: data.metadata,
        files: this.createDatasetFiles(data.data),
        isComplete: !!data.data.raceAnalysis,
        hasRaceAnalysis: !!data.data.raceAnalysis,
        hasInsights: !!data.data.insights,
        hasSocial: !!data.data.social
      };
    } catch (error) {
      console.error(`Failed to deserialize dataset ${id}:`, error);
      return null;
    }
  }

  private createDatasetFiles(processedData: any): { raceAnalysis?: DatasetFile; insights?: DatasetFile; social?: DatasetFile } {
    const files: any = {};
    
    if (processedData.raceAnalysis) {
      files.raceAnalysis = processedData.raceAnalysis.file;
    }
    if (processedData.insights) {
      files.insights = processedData.insights.file;
    }
    if (processedData.social) {
      files.social = processedData.social.file;
    }
    
    return files;
  }
}

// Export singleton instance
export const datasetManager = new DatasetManager();
export default datasetManager;
