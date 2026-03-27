// Shared WebRTC helper used by both room.html and random.html

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // ADD YOUR METERED TURN SERVERS BELOW:
    {
      urls: 'turn:global.relay.metered.ca:80',
      username: '10c2bf8c532d2660267fee1c',
      credential: 'metiiz5BkGRtAeuD'
    },
    {
      urls: 'turns:global.relay.metered.ca:80:443?transport=tcp',
      username: '10c2bf8c532d2660267fee1c',
      credential: 'metiiz5BkGRtAeuD'
    }
  ]
};

function createPeerConnection() {
  const pc = new RTCPeerConnection(ICE_SERVERS);
  return pc;
}
