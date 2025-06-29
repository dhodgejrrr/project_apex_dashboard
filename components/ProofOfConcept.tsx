import React from 'react';
import { CheckCircle, Clock, Trophy } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const ProofOfConcept: React.FC = () => {
  const { raceData } = useData();

  if (!raceData) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="bg-card rounded-2xl shadow-lg border border-border theme-transition">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-success" />
            <h2 className="text-xl font-bold text-card-foreground">
              Race Data Successfully Loaded
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Displaying {raceData.fastest_by_car_number.length} cars from the race analysis
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {raceData.fastest_by_car_number.map((car) => (
              <div
                key={car.car_number}
                className="bg-muted/30 rounded-xl p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 theme-transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {car.car_number}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Car #{car.car_number}
                    </span>
                  </div>
                  <Trophy className="h-4 w-4 text-warning" />
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Fastest Lap</span>
                    </div>
                    <p className="text-lg font-mono font-bold text-card-foreground">
                      {car.fastest_lap.time}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {car.fastest_lap.driver_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Lap {car.fastest_lap.lap_number}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Optimal:</span>
                      <span className="font-mono text-card-foreground">
                        {car.optimal_lap_time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProofOfConcept;