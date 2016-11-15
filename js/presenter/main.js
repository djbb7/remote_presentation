'use strict';


var dropZone = document.getElementById( 'dropit' );

var canvas = document.getElementById('the-canvas');

var pubsub = pubsubBuilder( {} );

var dragAndDropModule = dragAndDropModule( document, window, pubsub, dropZone );

var pdfModule = pdfModule( document, window, canvas );

//var webRTCModule = webRTCModule( io );

pubsub.subscribe('fileSelected', function( topic, file ) {

	pdfModule.showPDF( file, 1 );

	webRTCModule.sendPDF( file );

} );

pubsub.subscribe('pageChange', function( topic, direction ) {
	switch( direction ){
		case 'next':
			pdfModule.nextPage();
		break;
		case 'prev':
			pdfModule.prevPage();
		break;
	}
} );

document.onkeydown = function(e) {
		e = e || window.event;
		if( e.which == 39 ) {
			pubsub.publish( 'pageChange', 'next' );
		} else if( e.which == 37 ) {
			pubsub.publish( 'pageChange', 'prev' );
		}
};