import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OT from '@opentok/client';

const Room = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const videoContainerRef = useRef(null);

  const { apiKey, sessionId, token, roomName, userName, role } = state || {};

  useEffect(() => {
    if (!apiKey || !sessionId || !token) {
      console.error('Missing session details or API key');
      navigate('/');
      return;
    }

    console.log('Received API Key:', apiKey);
    console.log('Received Session ID:', sessionId);
    console.log('Received Token:', token);

    // Initialize session
    const session = OT.initSession(apiKey, sessionId);

    // Handle stream creation
    session.on('streamCreated', (event) => {
      console.log('Stream Created:', event.stream);

      if (!videoContainerRef.current) {
        console.error('videoContainerRef is null. Skipping append.');
        return;
      }

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

    // Handle session disconnection
    session.on('sessionDisconnected', (event) => {
      console.log('Session Disconnected:', event.reason);
    });

    // Handle errors
    session.on('error', (error) => {
      console.error('Session Error:', error.message);
    });

    // Connect to session
    session.connect(token, (err) => {
      if (err) {
        console.error('Error connecting to session:', err);
      } else {
        console.log(`Connected to session as ${userName} (${role})`);

        // Publish local stream
        if (!videoContainerRef.current) {
          console.error('videoContainerRef is null. Skipping publisher append.');
          return;
        }

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
      console.log('Cleaning up session');
      session.disconnect();
    };
  }, [apiKey, sessionId, token, userName, role, navigate]);

  return (
    <div>
      <h1>Room: {roomName}</h1>
      <div ref={videoContainerRef} style={{ display: 'flex', flexWrap: 'wrap' }}></div>
    </div>
  );
};

export default Room;