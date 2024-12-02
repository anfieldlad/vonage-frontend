import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './WaitingRoom.css'; // Pastikan CSS sudah benar

const WaitingRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const joinRoom = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(`${BACKEND_URL}/api/join-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, userName, role: 'publisher' }),
      });

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      const { apiKey, sessionId, token } = await response.json();
      navigate('/room', { state: { apiKey, sessionId, token, roomName, userName, role: 'publisher' } });
    } catch (error) {
      console.error('Error joining room:', error.message);
    }
  };

  const toggleVideo = () => {
    const stream = videoRef.current?.srcObject;
    const videoTrack = stream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    const stream = videoRef.current?.srcObject;
    const audioTrack = stream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error.message);
    }
  };

  const stopVideo = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  React.useEffect(() => {
    startVideo();
    return () => stopVideo();
  }, []);

  return (
    <div className="waiting-room-container">
      <h1 className="title">Join a Room</h1>
      <div className="form-container">
        <video ref={videoRef} autoPlay playsInline muted className="video-preview"></video>
        <div className="controls">
          <button onClick={toggleVideo} className={`btn ${videoEnabled ? 'enabled' : 'disabled'}`}>
            <i className={`fas ${videoEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
          </button>
          <button onClick={toggleAudio} className={`btn ${audioEnabled ? 'enabled' : 'disabled'}`}>
            <i className={`fas ${audioEnabled ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
          </button>
        </div>
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