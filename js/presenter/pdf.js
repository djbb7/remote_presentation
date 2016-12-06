
var pdfModule = function( document, window, canvas ) {

	var mPDF;

	var mViewport;

	var mPage; 

	function scaleCanvas() {

		var max_width = window.innerWidth - 20; // subtract margin

		var max_height = window.innerHeight - 20; 

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

		mPage.render(renderContext).then(function(){
			pubsub.publish('pdfRendered');
		});

	}

	function showPage( pageNumber ) {

		if( !mPDF ){
		
			return undefined;
		
		}

		if( pageNumber > mPDF.numPages || pageNumber < 1 ) {

			return false;

		}

		mPDF
		.getPage( pageNumber )
		.then( function( page ) {

			var scale = 1.0;

			mPage = page;

			mViewport = mPage.getViewport(scale);

			scaleCanvas();

		});

	}

	function nextPage () {

		if( !mPDF ){
		
			return undefined;
		
		}

		showPage ( mPage.pageIndex + 2 ); // index is 0-based, but pdf pages start from 1

	}

	function prevPage () {

		if( !mPDF ){
		
			return undefined;
		
		}

		showPage ( mPage.pageIndex ); // no need to subtract since index is 0-based, but pdf page count is not

	}

	function showPDF( file , page ) {

		var reader = new FileReader();

		reader.addEventListener( "load" , function() {

			PDFJS.getDocument( reader.result ).then( function( pdf ) {

				mPDF = pdf;

				if( !page ) {

					page = 1;

				}

				showPage( page );

			});

		}, false );

		reader.readAsDataURL( file );

	}

	return {
		showPDF: showPDF,
		nextPage: nextPage,
		prevPage: prevPage
	}

};