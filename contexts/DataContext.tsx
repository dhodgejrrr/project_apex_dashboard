import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RaceData } from '../types/race-data';

interface DataContextType {
  raceData: RaceData | null;
  setRaceData: (data: RaceData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [raceData, setRaceData] = useState<RaceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <DataContext.Provider
      value={{
        raceData,
        setRaceData,
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