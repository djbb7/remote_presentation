'use strict';

var dragAndDropModule = function ( document, window , pubsub, dropZone ) {

		// Feature detection
		var isAdvancedUpload = function() {

		var div = document.createElement( 'div' );

		return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;

	}();

	function notifyUpload( file ) {

		pubsub.publish('fileSelected', file );

	}

	// initialize file select behaviours
	var init = function ( form ) {

		var input = form.querySelector( 'input[type="file"]' ),
			label = form.querySelector( 'label' ),
			dropitMsg = form.querySelector( '.box__dropit' ),
			boxInput = form.querySelector( '.box__input'),
			droppedFiles = false

		// automatically submit the form on file select
		input.addEventListener( 'change', function( e ) {

			fileSelectedTime = Date.now();

			notifyUpload( e.target.files[0] );

		});

		// drag&drop files if the feature is available
		if( isAdvancedUpload ) {

			// letting the CSS part to know drag&drop is supported by the browser
			form.classList.add( 'has-advanced-upload' );

			// disable default behaviours
			[ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ].forEach( function( event ) {
				
				form.addEventListener( event, function( e ) {

					e.preventDefault();

					e.stopPropagation();

				});

			});

			[ 'dragover', 'dragenter' ].forEach( function( event ) {
				
				form.addEventListener( event, function() {

					form.classList.add( 'is-dragover' );

					dropitMsg.style.display = 'inline';

					label.style.display = 'none';

				});

			});

			['drop' ].forEach( function( event ) {
				
				form.addEventListener( event, function() {
				
					form.classList.remove( 'is-dragover' );

					boxInput.style.display = 'none';
				
				});
			
			});

			[ 'dragleave', 'dragend' ].forEach( function( event ) {
				
				form.addEventListener( event, function() {
				
					form.classList.remove( 'is-dragover' );

					boxInput.style.display = 'block';

					label.style.display = 'inline-block';

					dropitMsg.style.display = 'none';
				
				});
				
			});

			form.addEventListener( 'drop', function( e ) {

				droppedFiles = e.dataTransfer.files; // the files that were dropped

				notifyUpload( droppedFiles[0] );

			});
		}

		// Firefox focus bug fix for file input
		input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
		input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });

	}( dropZone );

};