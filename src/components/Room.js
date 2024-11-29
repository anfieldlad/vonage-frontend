import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OT from '@opentok/client';

const Room = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { roomName, sessionId, token, userName } = state || {};

  const subscriberContainer = useRef(null);
  const publisherContainer = useRef(null);

  useEffect(() => {
    if (!sessionId || !token) {
      navigate('/');
      return;
    }

    // Initialize the session
    const session = OT.initSession('<YOUR_API_KEY>', sessionId);

    // Connect to the session
    session.connect(token, (err) => {
      if (err) {
        console.error('Error connecting to session:', err);
      } else {
        console.log('Connected to session as', userName);

        // Publish to the session
        const publisher = OT.initPublisher(publisherContainer.current);
        session.publish(publisher, (error) => {
          if (error) console.error('Error publishing:', error);
        });

        // Subscribe to other streams
        session.on('streamCreated', (event) => {
          session.subscribe(event.stream, subscriberContainer.current, (error) => {
            if (error) console.error('Error subscribing to stream:', error);
          });
        });
      }
    });

    // Cleanup on unmount
    return () => {
      session.disconnect();
    };
  }, [sessionId, token, userName, navigate]);

  return (
    <div>
      <h1>Room: {roomName}</h1>
      <div>
        <h2>Publisher</h2>
        <div ref={publisherContainer} style={{ width: '400px', height: '300px', backgroundColor: '#ddd' }}></div>
      </div>
      <div>
        <h2>Subscriber</h2>
        <div ref={subscriberContainer} style={{ width: '400px', height: '300px', backgroundColor: '#ddd' }}></div>
      </div>
    </div>
  );
};

export default Room;
