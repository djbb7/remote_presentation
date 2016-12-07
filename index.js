'use strict';

var os = require('os');
var https = require('https');
var fs = require('fs');
var nodeStatic = require('node-static');
var socketIO = require('socket.io');
var express = require('express');

var options = {
		key: fs.readFileSync(__dirname + '/ssl/key.pem'),
		cert: fs.readFileSync(__dirname + '/ssl/cert.pem'),
		passphrase: 'caca'
};

var fileServer = new(nodeStatic.Server)();

// serving the socket.io client library
var app = express();

app.get('/b', (req, res) => {
	//fileServer.serve("indexb.html",res);
	res.sendFile("indexb.html", {root: __dirname})
});

app.get('/', (req, res) => {
	res.sendFile("indexp.html",{root: __dirname});
});

app.use('/b', express.static(__dirname));

app.use(express.static(__dirname));

app.server = https.createServer(options, app/*function(req, res) {
	fileServer.serve(req, res);
}*/).listen(process.env.PORT || 8080);

var io = socketIO.listen(app.server);

io.sockets.on('connection', function( socket ) {

	// convenience function to log server messages on the client
	function log() {
		var array = ['Message from server:'];
		array.push.apply(array, arguments);
		socket.emit('log', array);
	}

	socket.on('message', function( message ) {
		log('Client said: ', message);
		console.log(message);
		// for a real app, would be room-only (not broadcast)
		socket.broadcast.emit('message', message.msg);
		//TODO: send to room only
		// socket.to( message.room ).emit( 'message', message.msg );
	});

	socket.on( 'create', function( room ) {
		console.log( 'Received request to create room ' + room );

		socket.join( room , function() {
			socket.emit( 'created', room, socket.id );
		} );

	});

	socket.on('join', function(room) {
		console.log( 'Received request to join room ' + room );

		var roomExists = io.sockets.adapter.rooms[room] != undefined;

		if( !roomExists ){
			console.log('attempted to join empty room.');
			socket.emit( 'perror', { code: 404, msg: "Room does not exist." } );
			return;
		}

		var numClients = io.sockets.sockets.length;

		log('Room ' + room + ' now has ' + numClients + ' client(s)');

		log('Client ID ' + socket.id + ' joined room ' + room);

		socket.join(room);
		socket.emit('joined', room, socket.id);
		socket.to( room ).emit('ready', room );

	});

	socket.on('ipaddr', function() {
		var ifaces = os.networkInterfaces();
		for (var dev in ifaces) {
			ifaces[dev].forEach(function(details) {
				if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
					socket.emit('ipaddr', details.address);
				}
			});
		}
	});

	socket.on('bye', function(){
		console.log('received bye');
	});
});