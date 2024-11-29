import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinRoom } from '../api';

const WaitingRoom = () => {
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [role, setRole] = useState('publisher'); // Default role
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { sessionId, token } = await joinRoom(roomName, userName, role);
      // Navigate to the Room page with session data
      navigate('/room', { state: { roomName, sessionId, token, userName, role } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Waiting Room</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
        />
        <div>
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
        <button type="submit">Join Room</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default WaitingRoom;
