'use strict';

	;( function ( document, window, index )
	{

		var mPDF;

		var mViewport;

		var mPage; 

		// feature detection for drag&drop upload
		var isAdvancedUpload = function()
			{
				var div = document.createElement( 'div' );
				return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
			}();

		var rescaleViewport = function()
			{
				var max_width = window.innerWidth - 20;
				var max_height = window.innerHeight - 20; 
				var scale = (mViewport.width / mViewport.height < max_width / max_height) ? max_height/mViewport.height : max_width/mViewport.width;
				mViewport = mPage.getViewport(scale);

				renderCanvas();
			}

		var renderCanvas = function()
			{
 				//
				// Prepare canvas using PDF page dimensions
				//
				var canvas = document.getElementById('the-canvas');
				var context = canvas.getContext('2d');
				canvas.height = mViewport.height;
				canvas.width = mViewport.width;

   		        var renderContext = {
			        canvasContext: context,
			        viewport: mViewport
			    };
			    mPage.render(renderContext);
			}

		var showPage = function(pageNumber)
			{
				 //
			    // Fetch the first page
			    //
			    mPDF.getPage(pageNumber).then(function(page) {
				    var scale = 1.0;
				      
				    mPage = page;

				    mViewport = mPage.getViewport(scale);
				     
				    rescaleViewport();

			    });
			}

		// applying the effect for every form
		var forms = document.querySelectorAll( '.box' );
		Array.prototype.forEach.call( forms, function( form )
		{
			var input		 = form.querySelector( 'input[type="file"]' ),
				label		 = form.querySelector( 'label' ),
				dropitMsg    = form.querySelector( '.box__dropit' ),
				boxInput	 = form.querySelector( '.box__input'),
				droppedFiles = false,
				showFiles	 = function( files )
				{
					var reader = new FileReader();

					reader.addEventListener("load", function(){
						console.log("reader loaded");
						var preview = document.querySelector('#preview');

						PDFJS.getDocument(reader.result).then(function(pdf) {

							mPDF = pdf;

							showPage(1);
						   
						});
					}, false);

					reader.readAsDataURL(files[0]);

				}


			// automatically submit the form on file select
			input.addEventListener( 'change', function( e )
			{
				console.log("Input file changed");
				showFiles( e.target.files );				
			});

			// drag&drop files if the feature is available
			if( isAdvancedUpload )
			{
				form.classList.add( 'has-advanced-upload' ); // letting the CSS part to know drag&drop is supported by the browser

				[ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ].forEach( function( event )
				{
					form.addEventListener( event, function( e )
					{
						// preventing the unwanted behaviours
						e.preventDefault();
						e.stopPropagation();
					});
				});
				[ 'dragover', 'dragenter' ].forEach( function( event )
				{
					form.addEventListener( event, function()
					{
						form.classList.add( 'is-dragover' );

						dropitMsg.style.display = 'inline';
					});
				});
				[ 'dragleave', 'dragend', 'drop' ].forEach( function( event )
				{
					form.addEventListener( event, function()
					{
						form.classList.remove( 'is-dragover' );

						boxInput.style.display = 'none';
					});
				});
				form.addEventListener( 'drop', function( e )
				{
					droppedFiles = e.dataTransfer.files; // the files that were dropped
					showFiles( droppedFiles );
				});
			}

			var doResizeTimeout;
			window.onresize = function(){
				if(mViewport) {
					clearTimeout(doResizeTimeout);
					doResizeTimeout = setTimeout(rescaleViewport,100);
				}
			}

			// Firefox focus bug fix for file input
			input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
			input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });

		});
	}( document, window, 0 ));