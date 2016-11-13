'use strict';


var dropZone = document.getElementById( 'dropit' );

var canvas = document.getElementById('the-canvas');

var pubsub = pubsubBuilder( {} );

var dragAndDropModule = dragAndDropModule( document, window, pubsub, dropZone );

var pdfModule = pdfModule( document, window, canvas );

var webRTCModule = webRTCModule( io );

pubsub.subscribe('fileSelected', function( topic, file ) {

  pdfModule.showPDF( file, 1 );

  webRTCModule.sendPDF( file );

} );


