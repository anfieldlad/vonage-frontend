import React, { useEffect, useRef } from 'react';
import OT from '@vonage/client-sdk-video';

const Room = ({ appId, sessionId, token }) => {
  const videoContainerRef = useRef(null);

  useEffect(() => {
    if (!appId || !sessionId || !token) {
      console.error('Missing required parameters');
      return;
    }

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
  }, [appId, sessionId, token]);

  return (
    <div>
      <h1>Video Room</h1>
      <div ref={videoContainerRef} style={{ display: 'flex', flexWrap: 'wrap' }}></div>
    </div>
  );
};

export default Room;
