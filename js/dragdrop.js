'use strict';

	;( function ( document, window, index )
	{
		// feature detection for drag&drop upload
		var isAdvancedUpload = function()
			{
				var div = document.createElement( 'div' );
				return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
			}();


		// applying the effect for every form
		var forms = document.querySelectorAll( '.box' );
		Array.prototype.forEach.call( forms, function( form )
		{
			var input		 = form.querySelector( 'input[type="file"]' ),
				label		 = form.querySelector( 'label' ),
				dropitMsg    = form.querySelector( '.box__dropit' ),
				droppedFiles = false,
				showFiles	 = function( files )
				{
					var reader = new FileReader();

					reader.addEventListener("load", function(){
						console.log("reader loaded");
						var preview = document.querySelector('#preview');
						//preview.src = reader.result;
						//alert(PDFJS.workerSrc);

						PDFJS.getDocument(reader.result).then(function getPdfHelloWorld(pdf) {
						    //
						    // Fetch the first page
						    //
						    pdf.getPage(1).then(function getPageHelloWorld(page) {
						      var scale = 1.5;
						      var viewport = page.getViewport(scale);

						      //
						      // Prepare canvas using PDF page dimensions
						      //
						      var canvas = document.getElementById('the-canvas');
						      var context = canvas.getContext('2d');
						      canvas.height = viewport.height;
						      canvas.width = viewport.width;

						      //
						      // Render PDF page into canvas context
						      //
						      var renderContext = {
						        canvasContext: context,
						        viewport: viewport
						      };
						      page.render(renderContext);
						    });
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
					});
				});
				form.addEventListener( 'drop', function( e )
				{
					droppedFiles = e.dataTransfer.files; // the files that were dropped
					showFiles( droppedFiles );
				});
			}

			// Firefox focus bug fix for file input
			input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
			input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });

		});
	}( document, window, 0 ));