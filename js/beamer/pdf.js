
var pdfModule = function( document, window, canvas, pubsub ) {

	var mPDF;

	var mViewport;

	var mPage; 

	function showPDFFromBase64( pdfData , page ) {
		// Opening PDF by passing its binary data as a string. It is still preferable
		// to use Uint8Array, but string or array-like structure will work too.
		PDFJS.getDocument({data: pdfData}).then(function getPdfHelloWorld(pdf) {

			mPDF = pdf;

			pdf.getPage( page ).then(function getPageHelloWorld(page) {

				mPage = page;

				var scale = 1.0;

				mViewport = mPage.getViewport(scale);

				scaleCanvas();
			});
		});
	}

	function scaleCanvas() {

		var max_width = window.innerWidth; // subtract margin

		var max_height = window.innerHeight; 

		var scale = (mViewport.width / mViewport.height < max_width / max_height) ? max_height/mViewport.height : max_width/mViewport.width;

		mViewport = mPage.getViewport(scale);

		renderCanvas();

	}

	function renderCanvas() {

		// Prepare canvas using PDF page dimensions
		var context = canvas.getContext('2d');

		canvas.height = mViewport.height;

		canvas.width = mViewport.width;

		var renderContext = {
			canvasContext: context,
			viewport: mViewport
		};

		mPage.render(renderContext).then(function() {

			var fileRenderedTime = Date.now();

			console.log('PDF rendered. Time since file selected: '+ (fileRenderedTime - fileSelectedTime));

		});

	}

	function showPage( pageNumber ) {

		if( !mPDF ){
		
			console.log('mPDF undefined');
			return undefined;
		
		}

		if( pageNumber > mPDF.numPages || pageNumber < 1 ) {

			console.log('numPages undefined');
			return false;

		}

		console.log('get page');

		mPDF
		.getPage( pageNumber )
		.then( function( page ) {

			console.log('Got page')
			var scale = 1.0;

			mPage = page;

			mViewport = mPage.getViewport(scale);

			scaleCanvas();

		});

	}

	function nextPage () {
		console.log('nextPage called. ?');
		if( !mPDF ){
		
			return undefined;
		
		}

		console.log('showPage: '+ (mPage.pageIndex + 2));
		showPage ( mPage.pageIndex + 2 ); // index is 0-based, but pdf pages start from 1

	}

	function prevPage () {

		if( !mPDF ){
		
			return undefined;
		
		}

		showPage ( mPage.pageIndex ); // no need to subtract since index is 0-based, but pdf page count is not

	}


	return {
		showPDFFromBase64: showPDFFromBase64,
		nextPage: nextPage,
		prevPage: prevPage
	};

}