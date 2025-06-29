import React from 'react';
import { CheckCircle, Clock, Trophy } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const ProofOfConcept: React.FC = () => {
  const { raceData } = useData();

  if (!raceData) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Race Data Successfully Loaded
            </h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Displaying {raceData.fastest_by_car_number.length} cars from the race analysis
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {raceData.fastest_by_car_number.map((car) => (
              <div
                key={car.car_number}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {car.car_number}
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Car #{car.car_number}
                    </span>
                  </div>
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Fastest Lap</span>
                    </div>
                    <p className="text-lg font-mono font-bold text-gray-900">
                      {car.fastest_lap.time}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {car.fastest_lap.driver_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Lap {car.fastest_lap.lap_number}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Optimal:</span>
                      <span className="font-mono text-gray-700">
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