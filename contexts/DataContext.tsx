import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RaceData, InsightsData, SocialMediaData, CrossReference, DataRelationship } from '../types/race-data';

interface DataContextType {
  // Race data
  raceData: RaceData | null;
  setRaceData: (data: RaceData | null) => void;
  isLoadingRace: boolean;
  setIsLoadingRace: (loading: boolean) => void;
  raceError: string | null;
  setRaceError: (error: string | null) => void;

  // Insights data
  insightsData: InsightsData | null;
  setInsightsData: (data: InsightsData | null) => void;
  isLoadingInsights: boolean;
  setIsLoadingInsights: (loading: boolean) => void;
  insightsError: string | null;
  setInsightsError: (error: string | null) => void;

  // Social media data
  socialMediaData: SocialMediaData | null;
  setSocialMediaData: (data: SocialMediaData | null) => void;
  isLoadingSocial: boolean;
  setIsLoadingSocial: (loading: boolean) => void;
  socialError: string | null;
  setSocialError: (error: string | null) => void;

  // Cross-references
  crossReferences: CrossReference[];
  setCrossReferences: (refs: CrossReference[]) => void;

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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Race data state
  const [raceData, setRaceData] = useState<RaceData | null>(null);
  const [isLoadingRace, setIsLoadingRace] = useState(false);
  const [raceError, setRaceError] = useState<string | null>(null);

  // Insights data state
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Social media data state
  const [socialMediaData, setSocialMediaData] = useState<SocialMediaData | null>(null);
  const [isLoadingSocial, setIsLoadingSocial] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);

  // Cross-references state
  const [crossReferences, setCrossReferences] = useState<CrossReference[]>([]);

  // Utility functions
  const hasRaceData = () => raceData !== null;
  const hasInsightsData = () => insightsData !== null;
  const hasSocialMediaData = () => socialMediaData !== null;
  const isAnyLoading = () => isLoadingRace || isLoadingInsights || isLoadingSocial;
  const hasAnyError = () => raceError !== null || insightsError !== null || socialError !== null;
  
  const getAllErrors = () => {
    const errors: string[] = [];
    if (raceError) errors.push(`Race Data: ${raceError}`);
    if (insightsError) errors.push(`Insights: ${insightsError}`);
    if (socialError) errors.push(`Social Media: ${socialError}`);
    return errors;
  };

  const clearAllData = () => {
    setRaceData(null);
    setInsightsData(null);
    setSocialMediaData(null);
    setCrossReferences([]);
  };

  const clearAllErrors = () => {
    setRaceError(null);
    setInsightsError(null);
    setSocialError(null);
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

  // Legacy support for existing components
  const isLoading = isLoadingRace;
  const setIsLoading = setIsLoadingRace;
  const error = raceError;
  const setError = setRaceError;

  return (
    <DataContext.Provider
      value={{
        // Race data
        raceData,
        setRaceData,
        isLoadingRace,
        setIsLoadingRace,
        raceError,
        setRaceError,

        // Insights data
        insightsData,
        setInsightsData,
        isLoadingInsights,
        setIsLoadingInsights,
        insightsError,
        setInsightsError,

        // Social media data
        socialMediaData,
        setSocialMediaData,
        isLoadingSocial,
        setIsLoadingSocial,
        socialError,
        setSocialError,

        // Cross-references
        crossReferences,
        setCrossReferences,

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

        // Legacy support
        isLoading,
        setIsLoading,
        error,
        setError,
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