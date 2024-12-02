import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OT from '@opentok/client';
import './Room.css';

const Room = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const videoContainerRef = useRef(null);
    const [participants, setParticipants] = useState([]);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const publisherRef = useRef(null);

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
                    if (err) console.error('Error subscribing to stream:', err);
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

                publisherRef.current = publisher;
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

    const toggleVideo = () => {
        if (publisherRef.current) {
            const videoTrack = publisherRef.current.stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (publisherRef.current) {
            const audioTrack = publisherRef.current.stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setAudioEnabled(audioTrack.enabled);
            }
        }
    };

    return (
        <div className="room-container">
            <header className="room-header">
                <h1 className="room-title">Room: {roomName}</h1>
                <div className="user-info">You are logged in as: {userName}</div>
            </header>
            <div ref={videoContainerRef} className={`video-grid video-grid-${participants.length}`}></div>
            <footer className="room-controls">
                <button onClick={toggleVideo} className={`control-btn ${videoEnabled ? 'enabled' : 'disabled'}`}>
                    <i className={`fas ${videoEnabled ? 'fa-video' : 'fa-video-slash'}`}></i>
                </button>
                <button onClick={toggleAudio} className={`control-btn ${audioEnabled ? 'enabled' : 'disabled'}`}>
                    <i className={`fas ${audioEnabled ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
                </button>
            </footer>
        </div>
    );
};

export default Room;
