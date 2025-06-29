import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from '../contexts/DataContext';
import Dashboard from '../views/Dashboard';
import CarDetailView from '../views/CarDetailView';

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/car/:carNumber" element={<CarDetailView />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;