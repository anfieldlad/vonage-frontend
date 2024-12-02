import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WaitingRoom.css'; // Import CSS file

const WaitingRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const joinRoom = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const role = 'publisher'; // Role otomatis diatur sebagai 'publisher'

      // Fetch apiKey, sessionId, and token from backend
      const response = await fetch(`${BACKEND_URL}/api/join-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, userName, role }),
      });

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      const { apiKey, sessionId, token } = await response.json();

      // Navigate to the Room component with session details
      navigate('/room', { state: { apiKey, sessionId, token, roomName, userName, role } });
    } catch (error) {
      console.error('Error joining room:', error.message);
    }
  };

  return (
    <div className="waiting-room-container">
      <h1 className="title">Join a Room</h1>
      <div className="form-container">
        <input
          type="text"
          className="input"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
        />
        <input
          type="text"
          className="input"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <button className="join-btn" onClick={joinRoom}>
          Join Room
        </button>
      </div>
    </div>
  );
};

export default WaitingRoom;