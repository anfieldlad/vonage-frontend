import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OT from '@opentok/client';
import './Room.css';

const Room = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const videoContainerRef = useRef(null);

  const { sessionId, token, roomName, userName, role } = state || {};

  useEffect(() => {
    if (!sessionId || !token) {
      console.error('Missing session details or token is invalid.');
      navigate('/');
      return;
    }

    const appId = process.env.REACT_APP_VONAGE_APP_ID;

    console.log('Received API Key:', appId);
    console.log('Received Session ID:', sessionId);
    console.log('Received Token:', token);

    // Initialize session
    const session = OT.initSession(appId, sessionId);

    // Handle stream creation
    session.on('streamCreated', (event) => {
      console.log('Stream Created for Connection:', event.stream.connection);
      const connectionData = JSON.parse(event.stream.connection.data || '{}');
      const subscriberName = connectionData.name || 'Unknown User';

      if (!videoContainerRef.current) {
        console.error('videoContainerRef is null. Skipping append for subscriber.');
        return;
      }

      const subscriberContainer = document.createElement('div');
      subscriberContainer.className = 'video-container';

      const nameTag = document.createElement('div');
      nameTag.className = 'name-tag';
      nameTag.innerText = subscriberName;

      subscriberContainer.appendChild(nameTag);
      videoContainerRef.current.appendChild(subscriberContainer);

      session.subscribe(event.stream, subscriberContainer, { insertMode: 'append' }, (err) => {
        if (err) console.error('Error subscribing to stream:', err);
      });
    });

    // Connect to session
    session.connect(token, (err) => {
      if (err) {
        console.error('Error connecting to session:', err);
      } else {
        console.log(`Connected to session as ${userName} (${role})`);

        const publisherContainer = document.createElement('div');
        publisherContainer.className = 'video-container';

        const nameTag = document.createElement('div');
        nameTag.className = 'name-tag';
        nameTag.innerText = userName;

        publisherContainer.appendChild(nameTag);
        videoContainerRef.current.appendChild(publisherContainer);

        const publisher = OT.initPublisher(publisherContainer, { insertMode: 'append' });
        session.publish(publisher, (err) => {
          if (err) console.error('Error publishing stream:', err);
        });
      }
    });

    return () => {
      session.disconnect();
    };
  }, [sessionId, token, userName, role, navigate]);

  return (
    <div className="room-container">
      <header className="room-header">
        <h1 className="room-title">Room: {roomName}</h1>
        <div className="user-info">You are logged in as: {userName}</div>
      </header>
      <div ref={videoContainerRef} className="video-grid"></div>
    </div>
  );
};

export default Room;