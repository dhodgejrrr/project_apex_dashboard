import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileX, CheckCircle, Database, FileText, MessageSquare, TrendingUp, X, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { RaceData, InsightsData, SocialMediaData } from '../types/race-data';

interface FileUploadState {
  raceFile: File | null;
  insightsFile: File | null;
  socialFile: File | null;
}

const EnhancedFileUploader: React.FC = () => {
  const { 
    setRaceData, setInsightsData, setSocialMediaData,
    setIsLoadingRace, setIsLoadingInsights, setIsLoadingSocial,
    setRaceError, setInsightsError, setSocialError,
    isAnyLoading, hasAnyError, getAllErrors, clearAllErrors,
    extractDataRelationships
  } = useData();

  const [files, setFiles] = useState<FileUploadState>({
    raceFile: null,
    insightsFile: null,
    socialFile: null,
  });

  const [uploadProgress, setUploadProgress] = useState<{
    race: boolean;
    insights: boolean;
    social: boolean;
  }>({
    race: false,
    insights: false,
    social: false,
  });

  // Race data file drop zone
  const onRaceFileDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFiles(prev => ({ ...prev, raceFile: file }));
      setRaceError(null);
    }
  }, [setRaceError]);

  const { getRootProps: getRaceRootProps, getInputProps: getRaceInputProps, isDragActive: isRaceDragActive } = useDropzone({
    onDrop: onRaceFileDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false,
    disabled: isAnyLoading(),
    noClick: false,
    noKeyboard: false,
  });

  // Insights file drop zone
  const onInsightsFileDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFiles(prev => ({ ...prev, insightsFile: file }));
      setInsightsError(null);
    }
  }, [setInsightsError]);

  const { getRootProps: getInsightsRootProps, getInputProps: getInsightsInputProps, isDragActive: isInsightsDragActive } = useDropzone({
    onDrop: onInsightsFileDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false,
    disabled: isAnyLoading(),
    noClick: false,
    noKeyboard: false,
  });

  // Social media file drop zone
  const onSocialFileDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFiles(prev => ({ ...prev, socialFile: file }));
      setSocialError(null);
    }
  }, [setSocialError]);

  const { getRootProps: getSocialRootProps, getInputProps: getSocialInputProps, isDragActive: isSocialDragActive } = useDropzone({
    onDrop: onSocialFileDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false,
    disabled: isAnyLoading(),
    noClick: false,
    noKeyboard: false,
  });

  // File processing functions
  const processFile = async <T,>(
    file: File,
    setData: (data: T) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    validator?: (data: any) => boolean,
    progressKey?: keyof typeof uploadProgress
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    if (progressKey) {
      setUploadProgress(prev => ({ ...prev, [progressKey]: true }));
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);
          
          if (validator && !validator(data)) {
            throw new Error('Invalid file format');
          }
          
          setData(data);
          setLoading(false);
          if (progressKey) {
            setUploadProgress(prev => ({ ...prev, [progressKey]: false }));
          }
          resolve(true);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to parse JSON file';
          setError(errorMessage);
          setLoading(false);
          if (progressKey) {
            setUploadProgress(prev => ({ ...prev, [progressKey]: false }));
          }
          resolve(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read file');
        setLoading(false);
        if (progressKey) {
          setUploadProgress(prev => ({ ...prev, [progressKey]: false }));
        }
        resolve(false);
      };

      reader.readAsText(file);
    });
  };

  // Validators
  const validateRaceData = (data: any): boolean => {
    return data && Array.isArray(data.fastest_by_car_number) && data.fastest_by_car_number.length > 0;
  };

  const validateInsightsData = (data: any): boolean => {
    return data && typeof data.executive_summary === 'string' && Array.isArray(data.marketing_angles);
  };

  const validateSocialData = (data: any): boolean => {
    return data && Array.isArray(data.posts) && data.posts.length > 0;
  };

  // Handle visualization
  const handleVisualize = async () => {
    if (!files.raceFile) {
      setRaceError('Race analysis file is required');
      return;
    }

    clearAllErrors();

    // Process race data (required)
    const raceSuccess = await processFile<RaceData>(
      files.raceFile,
      setRaceData,
      setIsLoadingRace,
      setRaceError,
      validateRaceData,
      'race'
    );

    if (!raceSuccess) return;

    // Process insights data (optional)
    if (files.insightsFile) {
      await processFile<InsightsData>(
        files.insightsFile,
        setInsightsData,
        setIsLoadingInsights,
        setInsightsError,
        validateInsightsData,
        'insights'
      );
    }

    // Process social media data (optional)
    if (files.socialFile) {
      await processFile<SocialMediaData>(
        files.socialFile,
        setSocialMediaData,
        setIsLoadingSocial,
        setSocialError,
        validateSocialData,
        'social'
      );
    }

    // Extract data relationships after all files are processed
    setTimeout(() => {
      extractDataRelationships();
    }, 100);
  };

  // Remove file
  const removeFile = (fileType: keyof FileUploadState) => {
    setFiles(prev => ({ ...prev, [fileType]: null }));
  };

  // File upload card component
  const FileUploadCard: React.FC<{
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    file: File | null;
    onRemove: () => void;
    getRootProps: any;
    getInputProps: any;
    isDragActive: boolean;
    isRequired?: boolean;
    isLoading?: boolean;
    color: string;
  }> = ({ 
    title, 
    description, 
    icon: Icon, 
    file, 
    onRemove, 
    getRootProps, 
    getInputProps, 
    isDragActive, 
    isRequired = false,
    isLoading = false,
    color 
  }) => (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className={`h-2 bg-gradient-to-r ${color}`} />
      
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-card-foreground">{title}</h3>
            {isRequired && (
              <span className="text-xs text-error font-medium">Required</span>
            )}
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-4">{description}</p>

        {file ? (
          <div className="bg-muted rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              {!isLoading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="p-1 hover:bg-accent rounded-lg transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            
            {isLoading && (
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
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300
              ${isDragActive
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }
              ${isAnyLoading() ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} disabled={isAnyLoading()} />
            <Upload className={`h-8 w-8 mx-auto mb-3 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-sm font-medium text-card-foreground mb-1">
              {isDragActive ? 'Drop file here' : 'Click to browse or drag & drop'}
            </p>
            <p className="text-xs text-muted-foreground">JSON files only</p>
          </div>
        )}
      </div>
    </div>
  );

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

      {/* File Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileUploadCard
          title="Race Analysis"
          description="Main comprehensive race analysis data with lap times, strategies, and performance metrics."
          icon={Database}
          file={files.raceFile}
          onRemove={() => removeFile('raceFile')}
          getRootProps={getRaceRootProps}
          getInputProps={getRaceInputProps}
          isDragActive={isRaceDragActive}
          isRequired={true}
          isLoading={uploadProgress.race}
          color="from-primary to-primary/80"
        />

        <FileUploadCard
          title="Race Insights"
          description="Executive summary and marketing insights derived from the race analysis."
          icon={TrendingUp}
          file={files.insightsFile}
          onRemove={() => removeFile('insightsFile')}
          getRootProps={getInsightsRootProps}
          getInputProps={getInsightsInputProps}
          isDragActive={isInsightsDragActive}
          isLoading={uploadProgress.insights}
          color="from-info to-info/80"
        />

        <FileUploadCard
          title="Social Media"
          description="Generated social media content and posts based on race highlights and performance."
          icon={MessageSquare}
          file={files.socialFile}
          onRemove={() => removeFile('socialFile')}
          getRootProps={getSocialRootProps}
          getInputProps={getSocialInputProps}
          isDragActive={isSocialDragActive}
          isLoading={uploadProgress.social}
          color="from-success to-success/80"
        />
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

      {/* Visualize Button */}
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