import React, { useState, useEffect } from 'react';
import { Database, ChevronDown, CheckCircle, Folder } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { RaceData, InsightsData, SocialMediaData } from '../types/race-data';

interface Dataset {
  name: string;
  path: string;
  hasRaceAnalysis: boolean;
  hasInsights: boolean;
  hasSocial: boolean;
}

const DatasetSelector: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    setRaceData, setInsightsData, setSocialMediaData,
    setIsLoadingRace, setIsLoadingInsights, setIsLoadingSocial,
    setRaceError, setInsightsError, setSocialError,
    clearAllErrors, extractDataRelationships
  } = useData();

  // Scan for datasets on component mount
  useEffect(() => {
    scanDatasets();
  }, []);

  const scanDatasets = async () => {
    try {
      // In a real implementation, this would scan the file system
      // For now, we'll check for known datasets
      const knownDatasets = ['impc_watkins_2025'];
      const foundDatasets: Dataset[] = [];

      for (const datasetName of knownDatasets) {
        try {
          // Check which files exist for this dataset
          const basePath = `/data_sets/${datasetName}`;
          
          // Try to fetch each file to see if it exists
          const raceAnalysisExists = await checkFileExists(`${basePath}/race_analysis.json`);
          const insightsExists = await checkFileExists(`${basePath}/insights.json`);
          const socialExists = await checkFileExists(`${basePath}/social.json`);

          if (raceAnalysisExists || insightsExists || socialExists) {
            foundDatasets.push({
              name: datasetName,
              path: basePath,
              hasRaceAnalysis: raceAnalysisExists,
              hasInsights: insightsExists,
              hasSocial: socialExists,
            });
          }
        } catch (error) {
          console.warn(`Failed to check dataset ${datasetName}:`, error);
        }
      }

      setDatasets(foundDatasets);
    } catch (error) {
      console.error('Failed to scan datasets:', error);
      setError('Failed to scan available datasets');
    }
  };

  const checkFileExists = async (path: string): Promise<boolean> => {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const loadDataset = async (dataset: Dataset) => {
    setIsLoading(true);
    setError(null);
    clearAllErrors();

    try {
      // Load race analysis (required)
      if (dataset.hasRaceAnalysis) {
        setIsLoadingRace(true);
        try {
          const raceResponse = await fetch(`${dataset.path}/race_analysis.json`);
          if (!raceResponse.ok) throw new Error('Failed to fetch race analysis');
          const raceData: RaceData = await raceResponse.json();
          setRaceData(raceData);
          setIsLoadingRace(false);
        } catch (error) {
          setRaceError('Failed to load race analysis data');
          setIsLoadingRace(false);
        }
      }

      // Load insights (optional)
      if (dataset.hasInsights) {
        setIsLoadingInsights(true);
        try {
          const insightsResponse = await fetch(`${dataset.path}/insights.json`);
          if (!insightsResponse.ok) throw new Error('Failed to fetch insights');
          const insightsData: InsightsData = await insightsResponse.json();
          setInsightsData(insightsData);
          setIsLoadingInsights(false);
        } catch (error) {
          setInsightsError('Failed to load insights data');
          setIsLoadingInsights(false);
        }
      }

      // Load social media (optional)
      if (dataset.hasSocial) {
        setIsLoadingSocial(true);
        try {
          const socialResponse = await fetch(`${dataset.path}/social.json`);
          if (!socialResponse.ok) throw new Error('Failed to fetch social data');
          const socialData: SocialMediaData = await socialResponse.json();
          setSocialMediaData(socialData);
          setIsLoadingSocial(false);
        } catch (error) {
          setSocialError('Failed to load social media data');
          setIsLoadingSocial(false);
        }
      }

      // Extract data relationships after all files are processed
      setTimeout(() => {
        extractDataRelationships();
      }, 100);

      setSelectedDataset(dataset.name);
      setIsOpen(false);
    } catch (error) {
      setError('Failed to load dataset');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDatasetName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading || datasets.length === 0}
          className="
            w-full flex items-center justify-between px-4 py-3 
            bg-card border border-border rounded-xl
            text-card-foreground font-medium
            hover:bg-accent hover:border-primary/50
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 theme-transition
          "
        >
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <span>
              {selectedDataset 
                ? formatDatasetName(selectedDataset)
                : datasets.length > 0 
                  ? 'Select Dataset' 
                  : 'No Datasets Available'
              }
            </span>
          </div>
          {datasets.length > 0 && (
            <ChevronDown 
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && datasets.length > 0 && (
          <div className="
            absolute top-full left-0 right-0 mt-2 z-50
            bg-card border border-border rounded-xl shadow-xl
            overflow-hidden theme-transition
          ">
            <div className="max-h-64 overflow-y-auto">
              {datasets.map((dataset) => (
                <button
                  key={dataset.name}
                  onClick={() => loadDataset(dataset)}
                  disabled={isLoading}
                  className="
                    w-full px-4 py-3 text-left
                    hover:bg-accent transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    border-b border-border last:border-b-0
                  "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Folder className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium text-card-foreground">
                          {formatDatasetName(dataset.name)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {dataset.hasRaceAnalysis && (
                            <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                              Race
                            </span>
                          )}
                          {dataset.hasInsights && (
                            <span className="text-xs bg-info/20 text-info px-2 py-0.5 rounded-full">
                              Insights
                            </span>
                          )}
                          {dataset.hasSocial && (
                            <span className="text-xs bg-purple-500/20 text-purple-600 px-2 py-0.5 rounded-full">
                              Social
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedDataset === dataset.name && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary/30 border-t-primary" />
            <span className="text-primary font-medium">Loading dataset...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-xl">
          <p className="text-error font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default DatasetSelector;