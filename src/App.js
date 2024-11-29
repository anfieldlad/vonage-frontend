import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WaitingRoom from './components/WaitingRoom';
import Room from './components/Room';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WaitingRoom />} />
        <Route path="/room" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App;