import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OT from '@opentok/client';
import './Room.css';

const Room = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const videoContainerRef = useRef(null);
    const publisherRef = useRef(null);

    const [participants, setParticipants] = useState([]);
    const [isVideoEnabled, setVideoEnabled] = useState(true);
    const [isAudioEnabled, setAudioEnabled] = useState(true);
    const [isChatVisible, setChatVisible] = useState(false);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');

    const { sessionId, token, roomName, userName } = state || {};
    const sessionRef = useRef(null); // Store session for chat signals

    useEffect(() => {
        if (!sessionId || !token) {
            console.error('Missing session details');
            navigate('/');
            return;
        }

        const appId = process.env.REACT_APP_VONAGE_APP_ID;
        const session = OT.initSession(appId, sessionId);
        sessionRef.current = session; // Store session in ref

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
            session.subscribe(
                event.stream,
                subscriberContainer,
                {
                    insertMode: 'append',
                    width: '100%',
                    height: '100%',
                },
                (err) => {
                    if (err) {
                        console.error('Error subscribing to stream:', err);
                    }
                }
            );

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

        // Handle chat messages
        session.on('signal:chat', (event) => {
            const { data, from } = event;
            const fromSelf = from.connectionId === session.connection.connectionId;

            setMessages((prev) => [
                ...prev,
                { text: data, sender: fromSelf ? 'You' : JSON.parse(from.data).name },
            ]);
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
                    width: '100%',
                    height: '100%',
                });

                session.publish(publisher, (err) => {
                    if (err) console.error('Error publishing stream:', err);
                });

                publisherRef.current = publisher;

                // Add self to participants
                setParticipants((prev) => [...prev, { id: 'publisher', name: userName }]);
            }
        });

        return () => {
            session.disconnect();
        };
    }, [sessionId, token, userName, navigate]);

    const toggleVideo = () => {
        if (publisherRef.current) {
            const isCurrentlyEnabled = publisherRef.current.stream.hasVideo;
            publisherRef.current.publishVideo(!isCurrentlyEnabled);
            setVideoEnabled(!isCurrentlyEnabled);
        }
    };

    const toggleAudio = () => {
        if (publisherRef.current) {
            const isCurrentlyEnabled = publisherRef.current.stream.hasAudio;
            publisherRef.current.publishAudio(!isCurrentlyEnabled);
            setAudioEnabled(!isCurrentlyEnabled);
        }
    };

    const toggleChat = () => {
        setChatVisible(!isChatVisible);
    };

    const sendMessage = () => {
        if (chatInput.trim() && sessionRef.current) {
            sessionRef.current.signal(
                {
                    type: 'chat',
                    data: chatInput,
                },
                (error) => {
                    if (error) {
                        console.error('Error sending signal:', error);
                    } else {
                        setChatInput('');
                    }
                }
            );
        }
    };

    return (
        <div className="room-container">
            <header className="room-header">
                <h1 className="room-title">Room: {roomName}</h1>
                <div className="user-info">You are logged in as: {userName}</div>
            </header>
            <div
                ref={videoContainerRef}
                className={`video-grid video-grid-${participants.length} ${isChatVisible ? 'chat-visible' : ''}`}
            ></div>
            <div className="room-controls">
                <button
                    className={`control-btn ${isVideoEnabled ? 'enabled' : 'disabled'}`}
                    onClick={toggleVideo}
                >
                    <i className={`fas ${isVideoEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
                </button>
                <button
                    className={`control-btn ${isAudioEnabled ? 'enabled' : 'disabled'}`}
                    onClick={toggleAudio}
                >
                    <i className={`fas ${isAudioEnabled ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
                </button>
                <button
                    className={`control-btn ${isChatVisible ? 'active' : ''}`}
                    onClick={toggleChat}
                >
                    <i className={`fas ${isChatVisible ? 'fa-times' : 'fa-comments'}`}></i>
                </button>
            </div>
            {isChatVisible && (
                <div className="chat-sidebar">
                    <div className="chat-header">
                        <h3>In-call Messages</h3>
                        <button onClick={toggleChat} className="close-chat-btn">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className="chat-message">
                                <strong>{msg.sender}:</strong> {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Type a message"
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Room;