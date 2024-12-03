# Vonage Video Call Frontend

This is a frontend web application for managing video calls using [Vonage Video API](https://www.vonage.com/communications-apis/video/). Built with **ReactJS**, this application enables users to create and join video rooms with basic control functionalities like muting, toggling video, and interacting via chat.

This frontend application is part of a complete solution and is designed to work with the **Vonage Video Call Backend**, which is also available on GitHub [here](https://github.com/anfieldlad/vonage-backend). The backend handles session management, token generation, and other necessary server-side tasks.

## Features

- **Video Calling**: Connect to a video room using Vonage API to stream video and audio.
- **Chat Sidebar**: Send and receive messages during the video call.
- **Responsive Layout**: The video grid resizes dynamically depending on the number of participants and presence of the chat bar.
- **Video and Audio Control**: Toggle audio and video streams during the call.
- **Participant Management**: Dynamically add or remove participants when they join or leave the room.

## Getting Started

### Prerequisites

- **Node.js** (version 14 or above)
- **npm** or **yarn** for package management
- **Vonage Video API** credentials (app ID, session ID, and token)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/vonage-video-frontend.git
   cd vonage-video-frontend
   ```

2. **Install dependencies**:

   Using npm:

   ```bash
   npm install
   ```

   Or using yarn:

   ```bash
   yarn install
   ```

3. **Configure Environment Variables**:

   Create a `.env` file in the root directory with your Vonage credentials:

   ```
   REACT_APP_VONAGE_APP_ID=YOUR_APP_ID
   REACT_APP_VONAGE_SESSION_ID=YOUR_SESSION_ID
   REACT_APP_VONAGE_TOKEN=YOUR_TOKEN
   ```

### Running the Application

To run the application in development mode:

```bash
npm start
```

Or with yarn:

```bash
yarn start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Usage

- **Home Page**: Enter the session details to join a video call.
- **Video Room**: Once connected, you can:
  - Toggle video and audio.
  - Open the chat sidebar to send messages.
  - View participants and the video layout will adjust dynamically.

## Project Structure

- **`/src`**: Contains the source code.
  - **`Room.js`**: Main component for managing the video call, chat, and controls.
  - **`Room.css`**: Styling for the video call interface.
  - **`components/`**: Reusable UI components.

## Known Issues

- **Aspect Ratio Maintenance**: The video feed sometimes does not properly maintain the 16:9 aspect ratio when resizing the browser window or adjusting the chat bar.
- **Video Resizing on Chat Open**: When the chat bar is opened, the video grid might not resize correctly to the left.

These are ongoing issues being worked on, and contributions to solve them are welcomed.

## Contributions

Contributions are welcome! If you find any bugs or have suggestions for new features:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch-name`).
3. Make your changes and commit them (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch-name`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For further questions or issues, please contact [Bobby Ananta Dioriza](https://github.com/anfieldlad).

---

Happy coding! 😊
