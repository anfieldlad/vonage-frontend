import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WaitingRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const joinRoom = async () => {
    // Fetch sessionId and token from backend
    const response = await fetch('/api/join-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, userName }),
    });
    const { sessionId, token } = await response.json();

    navigate('/room', { state: { appId: '<YOUR_API_KEY>', sessionId, token } });
  };

  return (
    <div>
      <h1>Join a Room</h1>
      <input
        type="text"
        placeholder="Room Name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
};

export default WaitingRoom;
