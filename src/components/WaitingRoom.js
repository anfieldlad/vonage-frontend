import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WaitingRoom.css'; // Import CSS file

const WaitingRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('publisher'); // Default role
  const navigate = useNavigate();

  const joinRoom = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="role"
              value="publisher"
              checked={role === 'publisher'}
              onChange={(e) => setRole(e.target.value)}
            />
            Publisher
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="subscriber"
              checked={role === 'subscriber'}
              onChange={(e) => setRole(e.target.value)}
            />
            Subscriber
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="moderator"
              checked={role === 'moderator'}
              onChange={(e) => setRole(e.target.value)}
            />
            Moderator
          </label>
        </div>
        <button className="join-btn" onClick={joinRoom}>
          Join Room
        </button>
      </div>
    </div>
  );
};

export default WaitingRoom;