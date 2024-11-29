import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OT from '@opentok/client';

const Room = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const videoContainerRef = useRef(null);

  const { sessionId, token, roomName, userName, role } = state || {};

  useEffect(() => {
    if (!sessionId || !token) {
      console.error('Missing session details');
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
      const subscriberContainer = document.createElement('div');
      subscriberContainer.id = `subscriber-${event.stream.streamId}`;
      subscriberContainer.style.width = '300px';
      subscriberContainer.style.height = '200px';
      subscriberContainer.style.margin = '10px';
      videoContainerRef.current.appendChild(subscriberContainer);

      // Subscribe to the stream
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

        // Publish local stream
        const publisherContainer = document.createElement('div');
        publisherContainer.style.width = '300px';
        publisherContainer.style.height = '200px';
        publisherContainer.style.margin = '10px';
        videoContainerRef.current.appendChild(publisherContainer);

        const publisher = OT.initPublisher(publisherContainer, { insertMode: 'append' });
        session.publish(publisher, (err) => {
          if (err) console.error('Error publishing stream:', err);
        });
      }
    });

    // Cleanup on unmount
    return () => {
      session.disconnect();
    };
  }, [sessionId, token, userName, role, navigate]);

  return (
    <div>
      <h1>Room: {roomName}</h1>
      <div ref={videoContainerRef} style={{ display: 'flex', flexWrap: 'wrap' }}></div>
    </div>
  );
};

export default Room;
