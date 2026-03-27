// Shared WebRTC helper used by both room.html and random.html

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // your metered TURN servers here (keep them)
    {
      urls: 'turn:global.turn.metered.ca:80',
      username: '10c2bf8c532d2660267fee1c',
      credential: 'metiiz5BkGRtAeuD'
    },
    {
      urls: 'turns:global.turn.metered.ca:443?transport=tcp',
      username: '10c2bf8c532d2660267fee1c',
      credential: 'metiiz5BkGRtAeuD'
    }
  ]
};

function createPeerConnection() {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  pc.oniceconnectionstatechange = () => {
    console.log('🧊 ICE State:', pc.iceConnectionState);
  };

  pc.onsignalingstatechange = () => {
    console.log('📡 Signaling State:', pc.signalingState);
  };

  pc.onicecandidate = (e) => {
    console.log('🔍 ICE Candidate:', e.candidate ? 'found' : 'gathering done');
  };

  pc.onconnectionstatechange = () => {
    console.log('🔗 Connection State:', pc.connectionState);
  };

  return pc;
}
