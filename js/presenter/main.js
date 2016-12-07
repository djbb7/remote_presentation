'use strict';

//////////////////////////////////////
// UI elements
/////////////////////

var dropZone = document.getElementById( 'dropit' ),
	canvas = document.getElementById('the-canvas'),
	box_input = document.querySelectorAll('.box__input'),
	pencil = document.getElementById('pencil'),
	spinnerDiv = document.getElementById('spinner');

var pubsub = pubsubBuilder( {} );

var isDrawing = false;

var spinner;

//////////////////////////////////////
// Configure modules
/////////////////////

var dragAndDropModule = dragAndDropModule( document, window, pubsub, dropZone );

var pdfModule = pdfModule( document, window, canvas );

var webRTCModule = webRTCModule( io );

var drawModule = drawModule( canvas , webRTCModule.sendDraw);

var mc = new Hammer(canvas);

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

	pencil.classList.remove('invisible');
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


//////////////////////////////////////
// Draw logic
/////////////////////

pencil.addEventListener('click', function(){
	
	if(!isDrawing) {
		pencil.classList.remove('outset');
		pencil.classList.add('inset');
		drawModule.activate();
	} else {
		pencil.classList.add('outset');
		pencil.classList.remove('inset');
		drawModule.deactivate();
	}
	isDrawing = !isDrawing;

}, false);

//////////////////////////////////////
// Swipe page transitions
/////////////////////


mc.on("swiperight", function(ev) {
	if( !isDrawing ) {
		pubsub.publish( 'pageChange' , 'prev' );
	}
});

mc.on("swipeleft", function(ev) {
	if( !isDrawing ) {
		pubsub.publish( 'pageChange' , 'next' );
	}
});
