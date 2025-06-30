import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileX, CheckCircle, Database, FileText, MessageSquare, TrendingUp, X, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import DatasetSelector from './DatasetSelector';

interface FileUploadState {
  raceFile: File | null;
  insightsFile: File | null;
  socialFile: File | null;
}

const EnhancedFileUploader: React.FC = () => {
  const { 
    uploadFiles,
    isAnyLoading,
    hasAnyError,
    getAllErrors,
    clearAllErrors,
    hasRaceData
  } = useData();

  const [files, setFiles] = useState<FileUploadState>({
    raceFile: null,
    insightsFile: null,
    socialFile: null,
  });

  // Race data file drop zone
  const onRaceFileDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFiles(prev => ({ ...prev, raceFile: file }));
    }
  }, []);

  const { getRootProps: getRaceRootProps, getInputProps: getRaceInputProps, isDragActive: isRaceDragActive } = useDropzone({
    onDrop: onRaceFileDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false,
    disabled: isAnyLoading(),
  });

  // Insights file drop zone
  const onInsightsFileDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFiles(prev => ({ ...prev, insightsFile: file }));
    }
  }, []);

  const { getRootProps: getInsightsRootProps, getInputProps: getInsightsInputProps, isDragActive: isInsightsDragActive } = useDropzone({
    onDrop: onInsightsFileDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false,
    disabled: isAnyLoading(),
  });

  // Social media file drop zone
  const onSocialFileDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFiles(prev => ({ ...prev, socialFile: file }));
    }
  }, []);

  const { getRootProps: getSocialRootProps, getInputProps: getSocialInputProps, isDragActive: isSocialDragActive } = useDropzone({
    onDrop: onSocialFileDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false,
    disabled: isAnyLoading(),
  });

  // Handle visualization using new dataset system
  const handleVisualize = async () => {
    if (!files.raceFile) {
      return;
    }

    clearAllErrors();
    
    // Prepare files for upload
    const filesToUpload: { [key: string]: File } = {};
    
    if (files.raceFile) {
      filesToUpload.raceAnalysis = files.raceFile;
    }
    if (files.insightsFile) {
      filesToUpload.insights = files.insightsFile;
    }
    if (files.socialFile) {
      filesToUpload.social = files.socialFile;
    }

    // Upload files using the new dataset management system
    const success = await uploadFiles(filesToUpload);
    
    if (success) {
      // Clear the file inputs after successful upload
      setFiles({
        raceFile: null,
        insightsFile: null,
        socialFile: null,
      });
    }
  };

  // Remove file
  const removeFile = (fileType: keyof FileUploadState) => {
    setFiles(prev => ({ ...prev, [fileType]: null }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-black text-card-foreground mb-4 tracking-tight">
          Upload Race Analysis Files
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Upload your race analysis files to begin visualization. The main race analysis is required, 
          while insights and social media files are optional but provide enhanced analysis.
        </p>
      </div>

      {/* Dataset Selector */}
      <div className="bg-card rounded-2xl border border-border p-8 theme-transition">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-card-foreground mb-2">Quick Start with Sample Datasets</h3>
          <p className="text-muted-foreground">
            Select from available sample datasets to explore the dashboard features
          </p>
        </div>
        <div className="flex justify-center">
          <DatasetSelector />
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground font-medium">Or upload your own files</span>
        </div>
      </div>

      {/* File Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Race Analysis Upload */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 theme-transition">
          <div className="h-2 bg-gradient-to-r from-primary to-primary/80" />
          
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-card-foreground">Race Analysis</h3>
                <span className="text-xs text-error font-medium">Required</span>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              Main comprehensive race analysis data with lap times, strategies, and performance metrics.
            </p>

            {files.raceFile ? (
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{files.raceFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(files.raceFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  {!isAnyLoading() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile('raceFile');
                      }}
                      className="p-1 hover:bg-accent rounded-lg transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                
                {isAnyLoading() && (
                  <div className="mt-3">
                    <div className="w-full bg-muted-foreground/20 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Processing...</p>
                  </div>
                )}
              </div>
            ) : (
              <div
                {...getRaceRootProps()}
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300
                  ${isRaceDragActive
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }
                  ${isAnyLoading() ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input {...getRaceInputProps()} />
                <Upload className={`h-8 w-8 mx-auto mb-3 ${isRaceDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-sm font-medium text-card-foreground mb-1">
                  {isRaceDragActive ? 'Drop file here' : 'Click to browse or drag & drop'}
                </p>
                <p className="text-xs text-muted-foreground">JSON files only</p>
              </div>
            )}
          </div>
        </div>

        {/* Insights Upload */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 theme-transition">
          <div className="h-2 bg-gradient-to-r from-info to-info/80" />
          
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-info/80 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-card-foreground">Race Insights</h3>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              Executive summary and marketing insights derived from the race analysis.
            </p>

            {files.insightsFile ? (
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{files.insightsFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(files.insightsFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  {!isAnyLoading() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile('insightsFile');
                      }}
                      className="p-1 hover:bg-accent rounded-lg transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                
                {isAnyLoading() && (
                  <div className="mt-3">
                    <div className="w-full bg-muted-foreground/20 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Processing...</p>
                  </div>
                )}
              </div>
            ) : (
              <div
                {...getInsightsRootProps()}
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300
                  ${isInsightsDragActive
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }
                  ${isAnyLoading() ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input {...getInsightsInputProps()} />
                <Upload className={`h-8 w-8 mx-auto mb-3 ${isInsightsDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-sm font-medium text-card-foreground mb-1">
                  {isInsightsDragActive ? 'Drop file here' : 'Click to browse or drag & drop'}
                </p>
                <p className="text-xs text-muted-foreground">JSON files only</p>
              </div>
            )}
          </div>
        </div>

        {/* Social Media Upload */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 theme-transition">
          <div className="h-2 bg-gradient-to-r from-success to-success/80" />
          
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-card-foreground">Social Media</h3>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              Generated social media content and posts based on race highlights and performance.
            </p>

            {files.socialFile ? (
              <div className="bg-muted rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{files.socialFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(files.socialFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  {!isAnyLoading() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile('socialFile');
                      }}
                      className="p-1 hover:bg-accent rounded-lg transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                
                {isAnyLoading() && (
                  <div className="mt-3">
                    <div className="w-full bg-muted-foreground/20 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Processing...</p>
                  </div>
                )}
              </div>
            ) : (
              <div
                {...getSocialRootProps()}
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300
                  ${isSocialDragActive
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  }
                  ${isAnyLoading() ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input {...getSocialInputProps()} />
                <Upload className={`h-8 w-8 mx-auto mb-3 ${isSocialDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-sm font-medium text-card-foreground mb-1">
                  {isSocialDragActive ? 'Drop file here' : 'Click to browse or drag & drop'}
                </p>
                <p className="text-xs text-muted-foreground">JSON files only</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {hasAnyError() && (
        <div className="bg-error/10 border border-error/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-error/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-error" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-error mb-2">Upload Errors</h3>
              <div className="space-y-1">
                {getAllErrors().map((error, index) => (
                  <p key={index} className="text-error/80 font-medium">{error}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualize Button - Only show if files are selected and no data is loaded */}
      {!hasRaceData() && (
        <div className="flex justify-center">
          <button
            onClick={handleVisualize}
            disabled={!files.raceFile || isAnyLoading()}
            className="
              px-12 py-4 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground
              text-primary-foreground font-bold text-lg rounded-2xl
              transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-xl
              disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed
              flex items-center gap-3
            "
          >
            {isAnyLoading() ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Processing Files...
              </>
            ) : (
              <>
                <TrendingUp className="h-6 w-6" />
                Visualize Race Data
              </>
            )}
          </button>
        </div>
      )}

      {/* File Status Summary */}
      {(files.raceFile || files.insightsFile || files.socialFile) && (
        <div className="bg-muted/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-card-foreground mb-4">Upload Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${files.raceFile ? 'bg-success' : 'bg-muted-foreground/30'}`} />
              <span className="text-sm font-medium text-card-foreground">Race Analysis</span>
              {files.raceFile && <CheckCircle className="h-4 w-4 text-success ml-auto" />}
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${files.insightsFile ? 'bg-success' : 'bg-muted-foreground/30'}`} />
              <span className="text-sm font-medium text-card-foreground">Insights</span>
              {files.insightsFile && <CheckCircle className="h-4 w-4 text-success ml-auto" />}
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${files.socialFile ? 'bg-success' : 'bg-muted-foreground/30'}`} />
              <span className="text-sm font-medium text-card-foreground">Social Media</span>
              {files.socialFile && <CheckCircle className="h-4 w-4 text-success ml-auto" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFileUploader;