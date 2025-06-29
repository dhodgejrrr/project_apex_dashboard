import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileX, CheckCircle, Database } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { RaceData } from '../types/race-data';

const FileUploader: React.FC = () => {
  const { setRaceData, isLoading, setIsLoading, error, setError } = useData();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data: RaceData = JSON.parse(text);
          
          // Basic validation
          if (!data.fastest_by_car_number || !Array.isArray(data.fastest_by_car_number)) {
            throw new Error('Invalid race data format');
          }
          
          setRaceData(data);
          setIsLoading(false);
        } catch (error) {
          setError('Failed to parse JSON file. Please ensure it\'s a valid race analysis file.');
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read file');
        setIsLoading(false);
      };

      reader.readAsText(file);
    },
    [setRaceData, setIsLoading, setError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    multiple: false,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-3xl p-20 text-center cursor-pointer transition-all duration-300 ease-out theme-transition
          ${isDragActive
            ? 'border-primary bg-primary/5 scale-[1.02] shadow-2xl'
            : 'border-border hover:border-primary/50 hover:bg-accent/50 hover:shadow-xl'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={isLoading} />
        
        <div className="flex flex-col items-center gap-8">
          {isLoading ? (
            <div className="relative">
              <div className="animate-spin rounded-full h-24 w-24 border-4 border-primary/20 border-t-primary"></div>
              <Database className="absolute inset-0 m-auto h-10 w-10 text-primary" />
            </div>
          ) : (
            <div className="relative">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDragActive 
                  ? 'bg-primary/20 text-primary scale-110' 
                  : 'bg-muted text-muted-foreground group-hover:bg-muted/70'
              }`}>
                <Upload className="h-12 w-12" />
              </div>
              {isDragActive && (
                <div className="absolute -inset-2 bg-primary/20 rounded-2xl opacity-20 animate-pulse" />
              )}
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-card-foreground tracking-tight">
              {isLoading
                ? 'Processing race data...'
                : isDragActive
                ? 'Drop the file here'
                : 'Upload Race Analysis JSON'
              }
            </h3>
            <p className="text-muted-foreground text-xl max-w-md mx-auto font-medium">
              {!isLoading && (
                isDragActive
                  ? 'Release to upload and begin analysis'
                  : 'Drag and drop your comprehensive_analysis.json file, or click to browse'
              )}
            </p>
            
            {!isLoading && !isDragActive && (
              <div className="flex items-center justify-center gap-6 pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>JSON format</span>
                </div>
                <div className="w-1 h-1 bg-border rounded-full" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Instant analysis</span>
                </div>
                <div className="w-1 h-1 bg-border rounded-full" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Professional insights</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-8 p-8 bg-error/10 border-2 border-error/20 rounded-2xl theme-transition">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-error/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileX className="h-6 w-6 text-error" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-error">Upload Error</h3>
              <p className="text-error/80 mt-1 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;