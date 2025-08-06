import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import StudyMode from './components/StudyMode';
import ExperimentMode from './components/ExperimentMode';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/study/:module" element={<StudyMode />} />
          <Route path="/experiment/:module" element={<ExperimentMode />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
