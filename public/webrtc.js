// Shared WebRTC helper used by both room.html and random.html

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

function createPeerConnection() {
  const pc = new RTCPeerConnection(ICE_SERVERS);
  return pc;
}
