'use strict';

var canvas = document.getElementById('the-canvas'),
	roomURL = document.querySelectorAll('.room-code'),
	box = document.getElementById('box'),
	inst = document.querySelectorAll('.instructions'),
	instWaiting = document.querySelectorAll('.instructions .waiting'),
	instReady = document.querySelectorAll('.instructions .ready'),
	instConnected = document.querySelectorAll('.instructions .connected'),
	instURL = document.querySelectorAll('.instructions .url-instructions'),
	spinnerDiv = document.getElementById('spinner');


var pubsub = pubsubBuilder( {} );

var pdfModule = pdfModule( document, window, canvas, pubsub );

var drawModule = drawModule ( canvas );

var webRTCModule = webRTCModule( io , pubsub , drawModule.draw );

var spinner;

var fileSelectedTime;

pubsub.subscribe('receivingFile', function() {

	instConnected.forEach( (e) => { e.classList.add('invisible') });

	box.classList.add('invisible');

	inst.forEach( (e) => { e.classList.add('invisible') });

	spinner = new Spinner().spin(spinnerDiv);

});

pubsub.subscribe('fileReceived', function( topic, fileData ) {

	spinner.stop();

	canvas.classList.remove('invisible');

	pdfModule.showPDFFromBase64( fileData, 1 );

});

pubsub.subscribe('socketReady', function() {

	instWaiting.forEach( (e) => { e.classList.add('invisible') });

	instReady.forEach( (e) => { e.classList.remove('invisible') });

	instURL.forEach( (e) => { e.classList.add('less-opaque') });

});

pubsub.subscribe('peerConnected', function() {

	instReady.forEach( (e) => { e.classList.add('invisible') });

	instConnected.forEach( (e) => { e.classList.remove('invisible') });

});

pubsub.subscribe('pageChange', function( topic, direction ) {
	console.log('pageChange event: '+direction);
	switch( direction ){
		case 'next':
			pdfModule.nextPage();
		break;
		case 'prev':
			pdfModule.prevPage();
		break;
	}
} );