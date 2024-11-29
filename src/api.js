const BACKEND_URL = 'https://vonage-backend-chi.vercel.app/api/join-room';

/**
 * Join a room by name, username, and role.
 * @param {string} roomName - The name of the room.
 * @param {string} userName - The name of the user.
 * @param {string} role - The role of the user (publisher, subscriber, or moderator).
 * @returns {Promise<object>} - The sessionId and token for the room.
 */
export const joinRoom = async (roomName, userName, role) => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, userName, role }),
    });

    if (!response.ok) {
      throw new Error('Failed to join room');
    }

    return await response.json();
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};