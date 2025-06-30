import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RaceData, InsightsData, SocialMediaData, CrossReference } from '../types/race-data';
import { Dataset } from '../types/dataset-types';
import { datasetManager } from '../utils/dataset-manager';

interface DataContextType {
  // Race data
  raceData: RaceData | null;
  setRaceData: (data: RaceData | null) => void;
  raceDataString: string | null;
  setRaceDataString: (data: string | null) => void;
  isLoadingRace: boolean;
  setIsLoadingRace: (loading: boolean) => void;
  raceError: string | null;
  setRaceError: (error: string | null) => void;

  // Insights data
  insightsData: InsightsData | null;
  setInsightsData: (data: InsightsData | null) => void;
  insightsDataString: string | null;
  setInsightsDataString: (data: string | null) => void;
  isLoadingInsights: boolean;
  setIsLoadingInsights: (loading: boolean) => void;
  insightsError: string | null;
  setInsightsError: (error: string | null) => void;

  // Social media data
  socialMediaData: SocialMediaData | null;
  setSocialMediaData: (data: SocialMediaData | null) => void;
  socialDataString: string | null;
  setSocialDataString: (data: string | null) => void;
  isLoadingSocial: boolean;
  setIsLoadingSocial: (loading: boolean) => void;
  socialError: string | null;
  setSocialError: (error: string | null) => void;

  // Cross-references
  crossReferences: CrossReference[];
  setCrossReferences: (refs: CrossReference[]) => void;

  // Dataset management
  currentDataset: Dataset | null;
  setCurrentDataset: (dataset: Dataset | null) => void;
  availableDatasets: Dataset[];
  setAvailableDatasets: (datasets: Dataset[]) => void;
  isLoadingDatasets: boolean;
  setIsLoadingDatasets: (loading: boolean) => void;
  datasetError: string | null;
  setDatasetError: (error: string | null) => void;

  // Utility functions
  hasRaceData: () => boolean;
  hasInsightsData: () => boolean;
  hasSocialMediaData: () => boolean;
  isAnyLoading: () => boolean;
  hasAnyError: () => boolean;
  getAllErrors: () => string[];
  clearAllData: () => void;
  clearAllErrors: () => void;

  // Data relationship functions
  findCarReferences: (carNumber: string) => CrossReference[];
  findDriverReferences: (driverName: string) => CrossReference[];
  findManufacturerReferences: (manufacturer: string) => CrossReference[];
  extractDataRelationships: () => void;

  // Dataset management functions
  loadDatasetById: (datasetId: string) => Promise<boolean>;
  refreshAvailableDatasets: () => Promise<void>;
  uploadFiles: (files: { [key: string]: File }) => Promise<boolean>;
  deleteDataset: (datasetId: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Race data state
  const [raceData, setRaceData] = useState<RaceData | null>(null);
  const [raceDataString, setRaceDataString] = useState<string | null>(null);
  const [isLoadingRace, setIsLoadingRace] = useState(false);
  const [raceError, setRaceError] = useState<string | null>(null);

  // Insights data state
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [insightsDataString, setInsightsDataString] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Social media data state
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaData | null>(null);
  const [socialDataString, setSocialDataString] = useState<string | null>(null);
  const [isLoadingSocial, setIsLoadingSocial] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);

  // Cross-references state
  const [crossReferences, setCrossReferences] = useState<CrossReference[]>([]);

  // Dataset management state
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [availableDatasets, setAvailableDatasets] = useState<Dataset[]>([]);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);
  const [datasetError, setDatasetError] = useState<string | null>(null);

  // Utility functions
  const hasRaceData = () => raceData !== null;
  const hasInsightsData = () => insightsData !== null;
  const hasSocialMediaData = () => socialMediaData !== null;
  const isAnyLoading = () => isLoadingRace || isLoadingInsights || isLoadingSocial || isLoadingDatasets;
  const hasAnyError = () => raceError !== null || insightsError !== null || socialError !== null || datasetError !== null;
  
  const getAllErrors = () => {
    const errors: string[] = [];
    if (raceError) errors.push(`Race Data: ${raceError}`);
    if (insightsError) errors.push(`Insights: ${insightsError}`);
    if (socialError) errors.push(`Social Media: ${socialError}`);
    if (datasetError) errors.push(`Dataset: ${datasetError}`);
    return errors;
  };

  const clearAllData = () => {
    setRaceData(null);
    setRaceDataString(null);
    setInsightsData(null);
    setInsightsDataString(null);
    setSocialMediaData(null);
    setSocialDataString(null);
    setCrossReferences([]);
    setCurrentDataset(null);
  };

  const clearAllErrors = () => {
    setRaceError(null);
    setInsightsError(null);
    setSocialError(null);
    setDatasetError(null);
  };

  // Data relationship functions
  const findCarReferences = (carNumber: string): CrossReference[] => {
    return crossReferences.filter(ref => 
      ref.relationship.type === 'car' && 
      ref.relationship.identifier === carNumber
    );
  };

  const findDriverReferences = (driverName: string): CrossReference[] => {
    return crossReferences.filter(ref => 
      ref.relationship.type === 'driver' && 
      ref.relationship.identifier.toLowerCase().includes(driverName.toLowerCase())
    );
  };

  const findManufacturerReferences = (manufacturer: string): CrossReference[] => {
    return crossReferences.filter(ref => 
      ref.relationship.type === 'manufacturer' && 
      ref.relationship.identifier.toLowerCase().includes(manufacturer.toLowerCase())
    );
  };

  const extractDataRelationships = () => {
    const newCrossReferences: CrossReference[] = [];

    // Extract relationships from social media posts
    if (socialMediaData && raceData) {
      socialMediaData.posts.forEach((post, postIndex) => {
        const postText = post.text.toLowerCase();
        
        // Find car number references
        const carMatches = postText.match(/#(\d+)/g);
        if (carMatches) {
          carMatches.forEach(match => {
            const carNumber = match.replace('#', '');
            const raceCarExists = raceData.fastest_by_car_number.some(car => car.car_number === carNumber);
            
            if (raceCarExists) {
              newCrossReferences.push({
                sourceType: 'social',
                sourceId: `post-${postIndex}`,
                targetType: 'race',
                targetId: `car-${carNumber}`,
                relationship: {
                  type: 'car',
                  identifier: carNumber,
                  confidence: 0.9
                }
              });
            }
          });
        }

        // Find driver name references
        raceData.fastest_by_car_number.forEach(car => {
          const driverName = car.fastest_lap.driver_name.toLowerCase();
          if (postText.includes(driverName)) {
            newCrossReferences.push({
              sourceType: 'social',
              sourceId: `post-${postIndex}`,
              targetType: 'race',
              targetId: `driver-${car.fastest_lap.driver_name}`,
              relationship: {
                type: 'driver',
                identifier: car.fastest_lap.driver_name,
                confidence: 0.8
              }
            });
          }
        });

        // Find manufacturer references
        raceData.fastest_by_manufacturer.forEach(mfg => {
          const manufacturerName = mfg.manufacturer.toLowerCase();
          if (postText.includes(manufacturerName)) {
            newCrossReferences.push({
              sourceType: 'social',
              sourceId: `post-${postIndex}`,
              targetType: 'race',
              targetId: `manufacturer-${mfg.manufacturer}`,
              relationship: {
                type: 'manufacturer',
                identifier: mfg.manufacturer,
                confidence: 0.7
              }
            });
          }
        });
      });
    }

    // Extract relationships from insights data
    if (insightsData && raceData) {
      const insightsText = `${insightsData.executive_summary} ${insightsData.marketing_angles.join(' ')}`.toLowerCase();
      
      // Find manufacturer references in insights
      raceData.fastest_by_manufacturer.forEach(mfg => {
        const manufacturerName = mfg.manufacturer.toLowerCase();
        if (insightsText.includes(manufacturerName)) {
          newCrossReferences.push({
            sourceType: 'insights',
            sourceId: 'executive-summary',
            targetType: 'race',
            targetId: `manufacturer-${mfg.manufacturer}`,
            relationship: {
              type: 'manufacturer',
              identifier: mfg.manufacturer,
              confidence: 0.8
            }
          });
        }
      });
    }

    setCrossReferences(newCrossReferences);
  };

  // Dataset management functions
  const loadDatasetById = async (datasetId: string): Promise<boolean> => {
    setIsLoadingDatasets(true);
    setDatasetError(null);
    clearAllErrors();
    
    try {
      const result = await datasetManager.loadDataset(datasetId);
      
      if (!result.success) {
        setDatasetError(result.errors.join(', '));
        return false;
      }

      if (!result.dataset) {
        setDatasetError('No dataset data returned');
        return false;
      }

      setCurrentDataset(result.dataset);

      // Load the actual data from the dataset
      if (result.dataset.metadata.source === 'preloaded') {
        await loadPreloadedDatasetData(result.dataset);
      } else {
        await loadUploadedDatasetData(result.dataset);
      }

      // Extract data relationships after all files are processed
      setTimeout(() => {
        extractDataRelationships();
      }, 100);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDatasetError(errorMessage);
      return false;
    } finally {
      setIsLoadingDatasets(false);
    }
  };

  const refreshAvailableDatasets = async (): Promise<void> => {
    console.log('🔄 Refreshing available datasets...');
    setIsLoadingDatasets(true);
    setDatasetError(null);
    
    try {
      const datasets = await datasetManager.getAllDatasets();
      console.log('📊 Datasets loaded:', datasets);
      setAvailableDatasets(datasets);
    } catch (error) {
      console.error('❌ Error refreshing datasets:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh datasets';
      setDatasetError(errorMessage);
    } finally {
      setIsLoadingDatasets(false);
      console.log('✅ Dataset loading complete');
    }
  };

  // Initialize datasets on mount
  useEffect(() => {
    refreshAvailableDatasets();
  }, []);

  const uploadFiles = async (files: { [key: string]: File }): Promise<boolean> => {
    setIsLoadingDatasets(true);
    setDatasetError(null);
    clearAllErrors();
    
    try {
      const result = await datasetManager.uploadFiles(files);
      
      if (!result.success) {
        setDatasetError(result.errors.join(', '));
        return false;
      }

      if (result.dataset) {
        // Load the uploaded dataset data
        await loadUploadedDatasetData(result.dataset);
        setCurrentDataset(result.dataset);
        
        // Refresh available datasets
        await refreshAvailableDatasets();
        
        // Extract data relationships
        setTimeout(() => {
          extractDataRelationships();
        }, 100);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload files';
      setDatasetError(errorMessage);
      return false;
    } finally {
      setIsLoadingDatasets(false);
    }
  };

  const deleteDataset = async (datasetId: string): Promise<boolean> => {
    try {
      const success = await datasetManager.deleteDataset(datasetId);
      if (success) {
        // If the deleted dataset is currently loaded, clear data
        if (currentDataset && currentDataset.metadata.id === datasetId) {
          clearAllData();
        }
        // Refresh available datasets
        await refreshAvailableDatasets();
      }
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete dataset';
      setDatasetError(errorMessage);
      return false;
    }
  };

  // Helper functions for loading dataset data
  const loadPreloadedDatasetData = async (dataset: Dataset): Promise<void> => {
    // Load race analysis
    if (dataset.files.raceAnalysis) {
      setIsLoadingRace(true);
      try {
        const response = await fetch(dataset.files.raceAnalysis.path);
        if (!response.ok) throw new Error('Failed to fetch race analysis');
        const data: RaceData = await response.json();
        setRaceData(data);
        setRaceDataString(JSON.stringify(data));
      } catch (error) {
        setRaceError('Failed to load race analysis data');
      } finally {
        setIsLoadingRace(false);
      }
    }

    // Load insights
    if (dataset.files.insights) {
      setIsLoadingInsights(true);
      try {
        const response = await fetch(dataset.files.insights.path);
        if (!response.ok) throw new Error('Failed to fetch insights');
        const data: InsightsData = await response.json();
        setInsightsData(data);
        setInsightsDataString(JSON.stringify(data));
      } catch (error) {
        setInsightsError('Failed to load insights data');
      } finally {
        setIsLoadingInsights(false);
      }
    }

    // Load social media
    if (dataset.files.social) {
      setIsLoadingSocial(true);
      try {
        const response = await fetch(dataset.files.social.path);
        if (!response.ok) throw new Error('Failed to fetch social data');
        const data: SocialMediaData = await response.json();
        setSocialMediaData(data);
        setSocialDataString(JSON.stringify(data));
      } catch (error) {
        setSocialError('Failed to load social media data');
      } finally {
        setIsLoadingSocial(false);
      }
    }
  };

  const loadUploadedDatasetData = async (dataset: Dataset): Promise<void> => {
    // For uploaded datasets, data is stored in localStorage
    const stored = localStorage.getItem('apex_dashboard_datasets');
    if (!stored) return;

    const data = JSON.parse(stored);
    const datasetData = data[dataset.metadata.id];
    if (!datasetData) return;

    // Load race analysis
    if (datasetData.data.raceAnalysis) {
      setRaceData(datasetData.data.raceAnalysis.content);
      setRaceDataString(datasetData.data.raceAnalysis.rawContent);
    }

    // Load insights
    if (datasetData.data.insights) {
      setInsightsData(datasetData.data.insights.content);
      setInsightsDataString(datasetData.data.insights.rawContent);
    }

    // Load social media
    if (datasetData.data.social) {
      setSocialMediaData(datasetData.data.social.content);
      setSocialDataString(datasetData.data.social.rawContent);
    }
  };

  return (
    <DataContext.Provider
      value={{
        // Race data
        raceData,
        setRaceData,
        raceDataString,
        setRaceDataString,
        isLoadingRace,
        setIsLoadingRace,
        raceError,
        setRaceError,

        // Insights data
        insightsData,
        setInsightsData,
        insightsDataString,
        setInsightsDataString,
        isLoadingInsights,
        setIsLoadingInsights,
        insightsError,
        setInsightsError,

        // Social media data
        socialMediaData,
        setSocialMediaData,
        socialDataString,
        setSocialDataString,
        isLoadingSocial,
        setIsLoadingSocial,
        socialError,
        setSocialError,

        // Cross-references
        crossReferences,
        setCrossReferences,

        // Dataset management
        currentDataset,
        setCurrentDataset,
        availableDatasets,
        setAvailableDatasets,
        isLoadingDatasets,
        setIsLoadingDatasets,
        datasetError,
        setDatasetError,

        // Utility functions
        hasRaceData,
        hasInsightsData,
        hasSocialMediaData,
        isAnyLoading,
        hasAnyError,
        getAllErrors,
        clearAllData,
        clearAllErrors,

        // Data relationship functions
        findCarReferences,
        findDriverReferences,
        findManufacturerReferences,
        extractDataRelationships,

        // Dataset management functions
        loadDatasetById,
        refreshAvailableDatasets,
        uploadFiles,
        deleteDataset,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};