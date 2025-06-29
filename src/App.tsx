import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from '../contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from '../views/Dashboard';
import CarDetailView from '../views/CarDetailView';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <div className="theme-transition">
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/car/:carNumber" element={<CarDetailView />} />
            </Routes>
          </Router>
        </div>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;