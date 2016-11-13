'use strict';

var canvas = document.getElementById('the-canvas');

var roomURL = document.getElementById('url');

var pubsub = pubsubBuilder( {} );

var pdfModule = pdfModule( document, window, canvas );

var webRTCModule = webRTCModule( io , pubsub );

pubsub.subscribe('fileReceived', function( topic, fileData ) {

  pdfModule.showPDFFromBase64( fileData, 1 );

} );