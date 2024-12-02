import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OT from '@opentok/client';
import './Room.css';

const Room = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const videoContainerRef = useRef(null);
  const chatInputRef = useRef(null);

  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(false); // Toggle chat visibility

  const { sessionId, token, roomName, userName } = state || {};

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

      session.subscribe(
        event.stream,
        subscriberContainer,
        {
          insertMode: 'append',
          width: '100%',
          height: '100%',
        },
        (err) => {
          if (err) console.error('Error subscribing to stream:', err);
        }
      );

      setParticipants((prev) => [...prev, { id: event.stream.streamId, name: subscriberName }]);
    });

    // Handle stream destruction
    session.on('streamDestroyed', (event) => {
      const streamId = event.stream.streamId;
      const element = document.getElementById(`subscriber-${streamId}`);
      if (element) element.remove();
      setParticipants((prev) => prev.filter((p) => p.id !== streamId));
    });

    // Handle receiving messages
    session.on('signal:chat', (event) => {
      const sender = event.from.connectionId === session.connection.connectionId ? 'You' : event.from.data;
      const message = event.data;
      setMessages((prev) => [...prev, { sender, message }]);
    });

    session.connect(token, (err) => {
      if (err) {
        console.error('Error connecting to session:', err);
      } else {
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
          width: '100%',
          height: '100%',
        });

        session.publish(publisher, (err) => {
          if (err) console.error('Error publishing stream:', err);
        });

        setParticipants((prev) => [...prev, { id: 'publisher', name: userName }]);
      }
    });

    return () => {
      session.disconnect();
    };
  }, [sessionId, token, userName, navigate]);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;

    const appId = process.env.REACT_APP_VONAGE_APP_ID;
    const session = OT.initSession(appId, sessionId);

    session.signal(
      {
        type: 'chat',
        data: newMessage,
      },
      (error) => {
        if (error) {
          console.error('Error sending signal:', error);
        } else {
          setMessages((prev) => [...prev, { sender: 'You', message: newMessage }]);
          setNewMessage('');
        }
      }
    );
  };

  const toggleChat = () => {
    setIsChatVisible((prev) => !prev);
  };

  return (
    <div className="room-container">
      <header className="room-header">
        <h1 className="room-title">Room: {roomName}</h1>
        <button className="toggle-chat-btn" onClick={toggleChat}>
          {isChatVisible ? 'Hide Chat' : 'Show Chat'}
        </button>
      </header>
      <div className="room-content">
        <div
          ref={videoContainerRef}
          className={`video-grid video-grid-${participants.length} ${isChatVisible ? 'with-chat' : ''}`}
        ></div>
        {isChatVisible && (
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className="chat-message">
                  <strong>{msg.sender}: </strong> {msg.message}
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                ref={chatInputRef}
                type="text"
                value={newMessage}
                placeholder="Type a message..."
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;