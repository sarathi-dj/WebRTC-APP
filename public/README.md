# NexTalk — WebRTC Video Chat App

A full WebRTC video chat application with two modes:
- **Private Room**: Create a room, share an 8-character code, your friend joins
- **Random Match**: Get paired instantly with a random stranger (like Omegle)

## Tech Stack
- **Backend**: Node.js + Express + Socket.io (signaling server)
- **Frontend**: Vanilla HTML/CSS/JS
- **Video**: WebRTC (peer-to-peer, no video goes through the server)
- **STUN**: Google's free STUN servers

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# For development with auto-reload:
npm run dev
```

Then open http://localhost:3000 in your browser.

## Project Structure

```
webrtc-app/
├── server.js              # Socket.io signaling server
├── package.json
└── public/
    ├── index.html         # Home / landing page
    ├── room.html          # Private room page
    ├── random.html        # Random stranger matching page
    └── webrtc.js          # Shared WebRTC peer connection helper
```

## How It Works

### Private Room Flow
1. User A clicks "Create New Room" → server generates an 8-char code
2. User A shares the code with User B
3. User B enters the code and clicks Join
4. Server notifies User A that a peer joined → User A creates an offer
5. WebRTC handshake completes via Socket.io signaling
6. P2P video call established

### Random Match Flow
1. User clicks "Find Someone Now"
2. If no one is waiting → added to queue
3. If someone is in queue → both matched, assigned a temporary room
4. One side creates offer, other answers
5. P2P call begins
6. "Next" button: leaves current room, re-queues for a new match

## Notes
- Works best on Chrome and Firefox
- Requires HTTPS in production (WebRTC getUserMedia needs secure context)
- For production, add TURN servers (e.g. Twilio, Xirsys) for users behind strict NATs
