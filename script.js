const constraints = { audio: true };
let stream;
let peer;

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

startButton.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        const peerId = generateRandomId(); // Generate a random peer ID
        peer = new Peer(peerId, {
            host: 'your-peerjs-server.com', // PeerJS server host
            port: 9000, // PeerJS server port
            path: '/myapp' // Optional path for your PeerJS server
        });

        peer.on('open', () => {
            console.log('My peer ID is: ' + peer.id);
            broadcast(stream);
        });
    } catch (err) {
        console.error('Error accessing microphone:', err);
    }
});

stopButton.addEventListener('click', () => {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
    if (peer) {
        peer.disconnect();
    }
});

function broadcast(stream) {
    peer.on('call', call => {
        call.answer(stream); // Answer the call with our stream
        call.on('stream', remoteStream => {
            const audioElement = document.createElement('audio');
            audioElement.srcObject = remoteStream;
            audioElement.autoplay = true;
            document.body.appendChild(audioElement);
        });
    });

    // Call all peers connected to the server
    peer.listAllPeers(peers => {
        peers.forEach(peerId => {
            if (peerId !== peer.id) {
                const call = peer.call(peerId, stream);
                call.on('stream', remoteStream => {
                    const audioElement = document.createElement('audio');
                    audioElement.srcObject = remoteStream;
                    audioElement.autoplay = true;
                    document.body.appendChild(audioElement);
                });
            }
        });
    });
}

function generateRandomId() {
    return Math.random().toString(36).substr(2, 9);
}
