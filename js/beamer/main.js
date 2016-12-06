'use strict';

var canvas = document.getElementById('the-canvas');

var roomURL = document.getElementById('room-code');

var pubsub = pubsubBuilder( {} );

var pdfModule = pdfModule( document, window, canvas, pubsub );

var webRTCModule = webRTCModule( io , pubsub );

pubsub.subscribe('fileReceived', function( topic, fileData ) {

  pdfModule.showPDFFromBase64( fileData, 1 );

} );

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