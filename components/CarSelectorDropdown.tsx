import React, { useState, useMemo } from 'react';
import { ChevronDown, Car, Search, X } from 'lucide-react';
import { RaceData } from '../types/race-data';
import { getAvailableCars } from '../utils/timeline-event-extractor';

interface CarSelectorDropdownProps {
  raceData: RaceData | null;
  selectedCarNumber: string | null;
  onCarSelect: (carNumber: string | null) => void;
  disabled?: boolean;
}

interface CarOption {
  number: string;
  driver: string;
  team: string;
  manufacturer?: string;
}

const CarSelectorDropdown: React.FC<CarSelectorDropdownProps> = ({
  raceData,
  selectedCarNumber,
  onCarSelect,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const availableCars = useMemo(() => {
    if (!raceData) return [];
    return getAvailableCars(raceData);
  }, [raceData]);

  const filteredCars = useMemo(() => {
    if (!searchTerm) return availableCars;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return availableCars.filter(car => 
      car.number.toLowerCase().includes(lowercaseSearch) ||
      car.driver.toLowerCase().includes(lowercaseSearch) ||
      car.team.toLowerCase().includes(lowercaseSearch) ||
      (car.manufacturer && car.manufacturer.toLowerCase().includes(lowercaseSearch))
    );
  }, [availableCars, searchTerm]);

  const selectedCar = useMemo(() => {
    return availableCars.find(car => car.number === selectedCarNumber);
  }, [availableCars, selectedCarNumber]);

  const handleCarSelect = (car: CarOption) => {
    onCarSelect(car.number);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCarSelect(null);
  };

  const formatCarDisplay = (car: CarOption) => {
    const manufacturer = car.manufacturer ? ` (${car.manufacturer})` : '';
    return `#${car.number} ${car.driver}${manufacturer}`;
  };

  const getManufacturerBadgeColor = (manufacturer?: string) => {
    if (!manufacturer) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    
    const colors: Record<string, string> = {
      'Ferrari': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Mercedes': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      'Red Bull': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'McLaren': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Alpine': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'Aston Martin': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Williams': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      'AlphaTauri': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'Alfa Romeo': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Haas': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    };
    
    return colors[manufacturer] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  if (!raceData || availableCars.length === 0) {
    return (
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center px-4 py-3 bg-card border border-border rounded-xl text-muted-foreground">
          <Car className="h-5 w-5 mr-3" />
          <span>No cars available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        {/* Main Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="
            w-full flex items-center justify-between px-4 py-3
            bg-card border border-border rounded-xl
            text-card-foreground font-medium
            hover:bg-accent hover:border-primary/50
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 theme-transition
          "
          aria-label={selectedCar ? `Selected car: ${formatCarDisplay(selectedCar)}` : 'Select a car'}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Car className="h-5 w-5 text-primary flex-shrink-0" />
            {selectedCar ? (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="font-bold text-primary">#{selectedCar.number}</span>
                <span className="truncate">{selectedCar.driver}</span>
                {selectedCar.manufacturer && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getManufacturerBadgeColor(selectedCar.manufacturer)}`}>
                    {selectedCar.manufacturer}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">Select a car</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedCar && (
              <button
                onClick={handleClearSelection}
                className="p-1 hover:bg-muted rounded-full transition-colors"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <ChevronDown 
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="
            absolute top-full left-0 right-0 mt-2 z-50
            bg-card border border-border rounded-xl shadow-xl
            overflow-hidden theme-transition
            max-h-80 flex flex-col
          ">
            {/* Search Input */}
            {availableCars.length > 6 && (
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search cars, drivers, or teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="
                      w-full pl-10 pr-4 py-2
                      bg-background border border-border rounded-lg
                      text-sm text-card-foreground placeholder-muted-foreground
                      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                      theme-transition
                    "
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Car Options */}
            <div className="overflow-y-auto flex-1" role="listbox">
              {filteredCars.length === 0 ? (
                <div className="px-4 py-6 text-center text-muted-foreground">
                  <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No cars match your search</p>
                </div>
              ) : (
                filteredCars.map((car) => (
                  <button
                    key={car.number}
                    onClick={() => handleCarSelect(car)}
                    className="
                      w-full px-4 py-3 text-left
                      hover:bg-accent focus:bg-accent
                      focus:outline-none
                      transition-colors duration-150
                      border-b border-border last:border-b-0
                    "
                    role="option"
                    aria-selected={selectedCarNumber === car.number}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="font-bold text-primary text-lg">#{car.number}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-card-foreground truncate">
                            {car.driver}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {car.team}
                          </div>
                        </div>
                      </div>
                      
                      {car.manufacturer && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getManufacturerBadgeColor(car.manufacturer)}`}>
                          {car.manufacturer}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default CarSelectorDropdown;
