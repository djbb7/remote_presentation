
var webRTCModule = function( io ) {
	
	// var configuration = {
	//	 'iceServers': [{
	//		 'url': 'stun:stun.l.google.com:19302'
	//	 }]
	// };
	// {'url':'stun:stun.services.mozilla.com'}

	var configuration = null;

	var isInitiator;

	var room;

	var CHUNK_LEN = 64000; // Split data channel message in chunks of this byte length.

	var peerConn;

	var dataChannel;

	var socket;

	function createRoom() {
		room = window.location.hash = randomToken();
	}

	function setRoom( roomName ) {
		room = window.location.hash = randomToken();
	}

	/**
	* Send message to signaling server
	*/
	function sendMessage( message ) {
		console.log('Client sending message: ', message);
		socket.emit('message', message);
	}

	function sendPDF( file ) {

		console.log("sending file... ");

		var mReader = new window.FileReader();

		mReader.onload = function( event ){

			var allData = event.target.result.match( /,(.*)$/ )[1]; // conserve only base64 string

			var data; // chunk holder

			dataChannel.send( allData.length ); // notify how much data to receive

			for(var i=0; i < allData.length*1.0/CHUNK_LEN; i++){

					data = allData.slice( i*CHUNK_LEN , (i+1)*CHUNK_LEN );

					dataChannel.send(data);

			}
		};

		mReader.readAsDataURL( file ); // base64 encode selected file

	}

	function signalingMessageCallback(message) {
		if ( message.type === 'offer' ) {
			console.log('Got offer. Sending answer to peer.');
			peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {},
																		logError);
			peerConn.createAnswer(onLocalSessionCreated, logError);

		} else if ( message.type === 'answer' ) {
			console.log('Got answer.');
			peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {},
																		logError);
		} else if ( message.type === 'candidate' ) {
			peerConn.addIceCandidate(new RTCIceCandidate({
				candidate: message.candidate
			}));

		} else if ( message === 'bye' ) {
		// TODO: cleanup RTC connection?
		}
	}

	function createPeerConnection( isInitiator , config ) {
		console.log( 'Creating Peer connection as initiator?', isInitiator, 'config:',
								config );
		peerConn = new RTCPeerConnection( config );

		// send any ice candidates to the other peer
		peerConn.onicecandidate = function( event ) {
			console.log( 'icecandidate event:', event );
			if ( event.candidate ) {
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

		if ( isInitiator ) {
			console.log('Creating Data Channel');
			dataChannel = peerConn.createDataChannel( 'photos' );
			onDataChannelCreated( dataChannel );

			console.log('Creating an offer');
			peerConn.createOffer( onLocalSessionCreated, logError );
		} else {
			peerConn.ondatachannel = function( event ) {
				console.log( 'ondatachannel:' , event.channel );
				dataChannel = event.channel;
				onDataChannelCreated( dataChannel );
			};
		}
	}

	function onLocalSessionCreated( desc ) {
		console.log( 'local session created:' , desc );
		peerConn.setLocalDescription( desc , function() {
			console.log('sending local desc:', peerConn.localDescription);
			sendMessage( peerConn.localDescription );
		}, logError );
	}

	function onDataChannelCreated( channel ) {
		console.log('onDataChannelCreated:', channel);

		channel.onopen = function() {
			console.log('CHANNEL opened!!!');
		};
	}

	function randomToken() {

		return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);

	}

	function logError( err ) {

		console.log( err.toString() , err );

	}

	(function init() {
		// Connect to the signaling server
		socket = io.connect();

		var room = window.location.hash.substring( 1 );
		if (!room) {
			console.log("Error. No room specified");
			return;
		}

		socket.on( 'ipaddr', function( ipaddr ) {
			console.log('Server IP address is: ' + ipaddr);
			// updateRoomURL(ipaddr);
		});

		socket.on( 'joined', function( room, clientId ) {
			console.log('This peer has joined room', room, 'with client ID', clientId);
			isInitiator = false;
			createPeerConnection( isInitiator, configuration );
		});

		socket.on( 'full', function( room ) {
			alert('Room ' + room + ' is full. We will create a new room for you.');
			//window.location.hash = '';
			//window.location.reload();
		});

		socket.on( 'ready', function() {
			console.log('Socket is ready');
			createPeerConnection( isInitiator , configuration );
		});

		socket.on( 'log', function( array ) {
			console.log.apply( console , array );
		});

		socket.on( 'message', function( message ) {
			console.log('Client received message:', message);
			signalingMessageCallback( message );
		});

		socket.on( 'perror', function( e ) {
			console.log(e.msg);
		});

		// Join a room
		socket.emit( 'join' , room );

		if ( location.hostname.match(/localhost|127\.0\.0/) ) {
			socket.emit( 'ipaddr' );
		}
	})();

	return {
		createRoom: createRoom,
		setRoom: setRoom,
		sendPDF: sendPDF
	}
};