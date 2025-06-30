import React, { useState, useEffect } from 'react';
import { Database, ChevronDown, CheckCircle, Folder, Trash2, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Dataset } from '../types/dataset-types';

const DatasetSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    currentDataset,
    availableDatasets,
    isLoadingDatasets,
    datasetError,
    loadDatasetById,
    refreshAvailableDatasets,
    deleteDataset,
    clearAllErrors
  } = useData();

  // Load available datasets on component mount (if not already loaded)
  useEffect(() => {
    if (!isLoadingDatasets && availableDatasets.length === 0 && !datasetError) {
      refreshAvailableDatasets();
    }
  }, [isLoadingDatasets, availableDatasets.length, datasetError, refreshAvailableDatasets]);

  const handleLoadDataset = async (dataset: Dataset) => {
    setIsOpen(false);
    clearAllErrors();
    
    const success = await loadDatasetById(dataset.metadata.id);
    if (!success) {
      console.error('Failed to load dataset:', dataset.metadata.name);
    }
  };

  const handleDeleteDataset = async (dataset: Dataset, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (dataset.metadata.source === 'preloaded') {
      return; // Cannot delete preloaded datasets
    }

    if (confirm(`Are you sure you want to delete "${dataset.metadata.displayName}"?`)) {
      await deleteDataset(dataset.metadata.id);
    }
  };

  const formatDatasetName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDatasetDisplayName = (dataset: Dataset) => {
    return dataset.metadata.displayName || formatDatasetName(dataset.metadata.name);
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoadingDatasets || availableDatasets.length === 0}
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
              {currentDataset 
                ? getDatasetDisplayName(currentDataset)
                : availableDatasets.length > 0 
                  ? 'Select Dataset' 
                  : 'No Datasets Available'
              }
            </span>
          </div>
          {availableDatasets.length > 0 && (
            <ChevronDown 
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && availableDatasets.length > 0 && (
          <div className="
            absolute top-full left-0 right-0 mt-2 z-50
            bg-card border border-border rounded-xl shadow-xl
            overflow-hidden theme-transition
          ">
            <div className="max-h-64 overflow-y-auto">
              {availableDatasets.map((dataset) => (
                <button
                  key={dataset.metadata.id}
                  onClick={() => handleLoadDataset(dataset)}
                  disabled={isLoadingDatasets}
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
                          {getDatasetDisplayName(dataset)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            dataset.metadata.source === 'preloaded' 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-secondary/20 text-secondary'
                          }`}>
                            {dataset.metadata.source === 'preloaded' ? 'Sample' : 'Uploaded'}
                          </span>
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
                    
                    <div className="flex items-center gap-2">
                      {currentDataset && currentDataset.metadata.id === dataset.metadata.id && (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                      {dataset.metadata.source === 'uploaded' && (
                        <button
                          onClick={(e) => handleDeleteDataset(dataset, e)}
                          className="p-1 hover:bg-error/10 rounded-lg transition-colors group"
                          title="Delete dataset"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-error" />
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoadingDatasets && (
        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary/30 border-t-primary" />
            <span className="text-primary font-medium">Loading datasets...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {datasetError && (
        <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-error font-medium">Dataset Error</p>
              <p className="text-error/80 text-sm mt-1">{datasetError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingDatasets && availableDatasets.length === 0 && !datasetError && (
        <div className="mt-4 p-4 bg-muted/50 border border-border rounded-xl text-center">
          <Folder className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground font-medium">No datasets available</p>
          <p className="text-muted-foreground/70 text-sm mt-1">
            Upload files using the form below to get started
          </p>
        </div>
      )}
    </div>
  );
};

export { DatasetSelector };
export default DatasetSelector;
