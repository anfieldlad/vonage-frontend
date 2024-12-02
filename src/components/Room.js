import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OT from '@opentok/client';
import './Room.css';

const Room = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const videoContainerRef = useRef(null);
  const [participants, setParticipants] = useState([]);

  const { sessionId, token, roomName, userName, role } = state || {};

  useEffect(() => {
    if (!sessionId || !token) {
      console.error('Missing session details');
      navigate('/');
      return;
    }

    const appId = process.env.REACT_APP_VONAGE_APP_ID;
    const session = OT.initSession(appId, sessionId);

    // Handle stream creation
    session.on('streamCreated', (event) => {
      const connectionData = JSON.parse(event.stream.connection.data || '{}');
      const subscriberName = connectionData.name || 'Unknown User';

      if (!videoContainerRef.current) return;

      const subscriberContainer = document.createElement('div');
      subscriberContainer.className = 'video-container';
      subscriberContainer.id = `subscriber-${event.stream.streamId}`;

      const nameTag = document.createElement('div');
      nameTag.className = 'name-tag';
      nameTag.innerText = subscriberName;

      subscriberContainer.appendChild(nameTag);
      videoContainerRef.current.appendChild(subscriberContainer);

      // Subscribe to the stream
      session.subscribe(event.stream, subscriberContainer, { insertMode: 'append' }, (err) => {
        if (err) console.error('Error subscribing to stream:', err);
      });

      // Add participant to state
      setParticipants((prev) => [...prev, { id: event.stream.streamId, name: subscriberName }]);
    });

    // Handle stream destruction
    session.on('streamDestroyed', (event) => {
      const streamId = event.stream.streamId;
      const element = document.getElementById(`subscriber-${streamId}`);
      if (element) {
        element.remove();
      }
      setParticipants((prev) => prev.filter((p) => p.id !== streamId));
    });

    // Connect to session
    session.connect(token, (err) => {
      if (err) {
        console.error('Error connecting to session:', err);
      } else {
        console.log(`Connected to session as ${userName}`);

        const publisherContainer = document.createElement('div');
        publisherContainer.className = 'video-container';
        publisherContainer.id = 'publisher';

        const nameTag = document.createElement('div');
        nameTag.className = 'name-tag';
        nameTag.innerText = userName;

        publisherContainer.appendChild(nameTag);
        videoContainerRef.current.appendChild(publisherContainer);

        const publisher = OT.initPublisher(publisherContainer, {
            insertMode: 'append',
            width: '100%', // Set width ke 100% dari kontainer
            height: '100%' // Set height ke 100% dari kontainer
          });
        session.publish(publisher, (err) => {
          if (err) console.error('Error publishing stream:', err);
        });

        // Add self to participants
        setParticipants((prev) => [...prev, { id: 'publisher', name: userName }]);
      }
    });

    return () => {
      session.disconnect();
    };
  }, [sessionId, token, userName, navigate]);

  return (
    <div className="room-container">
      <header className="room-header">
        <h1 className="room-title">Room: {roomName}</h1>
        <div className="user-info">You are logged in as: {userName}</div>
      </header>
      <div
        ref={videoContainerRef}
        className={`video-grid video-grid-${participants.length}`}
      ></div>
    </div>
  );
};

export default Room;