'use strict';

var webRTCModule = function( io , pubsub ) {

	var configuration = {
		 'iceServers': [{
			 'url': 'stun:stun.l.google.com:19302'
		 }]
	};
	//{'url':'stun:stun.services.mozilla.com'}

	var configuration = null;

	var pdfData;

	var isInitiator;

	var room;

	var peerConn;

	var dataChannel;

	var socket;

	function sendMessage(message) {
		console.log('Client sending message: ', message);
		socket.emit('message', {msg: message, room: room});
	}


	function signalingMessageCallback(message) {
		if (message.type === 'offer') {
			console.log('Got offer. Sending answer to peer.');
			peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {},
																		logError);
			peerConn.createAnswer(onLocalSessionCreated, logError);

		} else if (message.type === 'answer') {
			console.log('Got answer.');
			peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {},
																		logError);

		} else if (message.type === 'candidate') {
			peerConn.addIceCandidate(new RTCIceCandidate({
				candidate: message.candidate
			}));

		} else if (message === 'bye') {
		// TODO: cleanup RTC connection?
		}
	}

	function createPeerConnection(isInitiator, config) {
		console.log('Creating Peer connection as initiator?', isInitiator, 'config:',
								config);
		peerConn = new RTCPeerConnection(config);

		// send any ice candidates to the other peer
		peerConn.onicecandidate = function(event) {
			console.log('icecandidate event:', event);
			if (event.candidate) {
				sendMessage({
					type: 'candidate',
					label: event.candidate.sdpMLineIndex,
					id: event.candidate.sdpMid,
					candidate: event.candidate.candidate
				});
			} else {
				console.log('End of candidates.');
			}
		};

		if (isInitiator) {
			console.log('Creating Data Channel');
			dataChannel = peerConn.createDataChannel('photos');
			onDataChannelCreated(dataChannel);

			console.log('Creating an offer');
			peerConn.createOffer(onLocalSessionCreated, logError);
		} else {
			peerConn.ondatachannel = function(event) {
				console.log('ondatachannel:', event.channel);
				dataChannel = event.channel;
				onDataChannelCreated(dataChannel);
			};
		}
	}

	function onLocalSessionCreated(desc) {
		console.log('local session created:', desc);
		peerConn.setLocalDescription(desc, function() {
			console.log('sending local desc:', peerConn.localDescription);
			sendMessage(peerConn.localDescription);
		}, logError);
	}

	function onDataChannelCreated(channel) {
		console.log('onDataChannelCreated:', channel);

		channel.onopen = function() {
			console.log('CHANNEL opened!!!');
			pubsub.publish( 'peerConnected' );
		};

		channel.onmessage = receiveDataFactory();
	}

	function receiveDataFactory() {
		var buf, count, total, direction, first = true, chunk = 1;

		return function onmessage(event) {
			
			if (first) {
				
				var jsonData = JSON.parse( event.data );
				console.log( 'Received instruction: '+jsonData.cmd );
				switch( jsonData.cmd ) {
					case 'receiveFile':
						pubsub.publish('receivingFile');
						total = jsonData.length;
						buf = window.buf = new Array();
						count = 0;
						first = false;
						break;
					case 'moveSlide':
						direction = jsonData.direction;
						console.log( direction );
						pubsub.publish( 'pageChange', direction );
						break;
				}

				return;
			}

			chunk += 1;

			buf.push(event.data);

			count += event.data.length;

			if (count === total) {
				// we're done: all data chunks have been received
				pdfData = atob(buf.join(''));

				pubsub.publish('fileReceived', pdfData);

				first = true;
			}
		};
	}

	function randomToken() {
		return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1,6);
	}

	function logError(err) {
		console.log(err.toString(), err);
	}

	(function init() {
		// Create a random room if not already present in the URL.
		room = window.location.hash.substring(1);
		if (!room) {
			room = window.location.hash = randomToken();
		}
		roomURL.forEach( (e) => { 
				e.innerHTML = "#" + room; 
			});

		// Connect to the signaling server
		socket = io.connect();

		socket.on('ipaddr', function(ipaddr) {
			console.log('Server IP address is: ' + ipaddr);
		});

		socket.on('created', function(room, clientId) {
			console.log('Created room', room, '- my client ID is', clientId);
			isInitiator = true;
		});

		socket.on('joined', function(room, clientId) {
			console.log('This peer has joined room', room, 'with client ID', clientId);
			isInitiator = false;
			createPeerConnection(isInitiator, configuration);
		});

		socket.on('ready', function() {
			console.log('Socket is ready');
			pubsub.publish('socketReady');
			createPeerConnection(isInitiator, configuration);
		});

		socket.on('log', function(array) {
			console.log.apply(console, array);
		});

		socket.on('message', function(message) {
			console.log('Client received message:', message);
			signalingMessageCallback(message);
		});

		// Join a room
		socket.emit('create', room);

		if (location.hostname.match(/localhost|127\.0\.0/)) {
			socket.emit('ipaddr');
		}
	})();
};