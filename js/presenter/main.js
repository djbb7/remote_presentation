'use strict';

//////////////////////////////////////
// UI elements
/////////////////////

var dropZone = document.getElementById( 'dropit' ),
	canvas = document.getElementById('the-canvas'),
	box_input = document.querySelectorAll('.box__input'),
	spinnerDiv = document.getElementById('spinner');

var pubsub = pubsubBuilder( {} );

var spinner;

//////////////////////////////////////
// Configure modules
/////////////////////

var dragAndDropModule = dragAndDropModule( document, window, pubsub, dropZone );

var pdfModule = pdfModule( document, window, canvas );

var webRTCModule = webRTCModule( io );

var drawModule = drawModule( canvas );

//////////////////////////////////////
// Subscribe to events
/////////////////////

pubsub.subscribe('fileSelected', function( topic, file ) {

	spinner = new Spinner().spin(spinnerDiv);

	box_input.forEach( (e) => { e.classList.add('invisible') } );

	pdfModule.showPDF( file, 1 );

	webRTCModule.sendPDF( file );

} );

pubsub.subscribe('pdfRendered', function() {
	spinner.stop();
});

pubsub.subscribe('pageChange', function( topic, direction ) {
	switch( direction ){
		case 'next':
			pdfModule.nextPage();
			webRTCModule.notifyNextPage();
		break;
		case 'prev':
			pdfModule.prevPage();
			webRTCModule.notifyPrevPage();
		break;
	}
} );

// listen for left and right keyboard arrows
document.onkeydown = function(e) {
		e = e || window.event;
		if( e.which == 39 ) {
			pubsub.publish( 'pageChange', 'next' );
		} else if( e.which == 37 ) {
			pubsub.publish( 'pageChange', 'prev' );
		}
};

var mc = new Hammer(canvas);

mc.on("swiperight", function(ev) {
	console.log(ev.type + " gesture detected.");
	pubsub.publish( 'pageChange' , 'prev' );
});

mc.on("swipeleft", function(ev) {
	console.log(ev.type + " gesture detected.");
	pubsub.publish( 'pageChange' , 'next' );
});