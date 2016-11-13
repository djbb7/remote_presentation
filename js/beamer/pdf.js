
var pdfModule = function( document, window, canvas ) {

	function showPDFFromBase64( pdfData , page ) {
		// Opening PDF by passing its binary data as a string. It is still preferable
		// to use Uint8Array, but string or array-like structure will work too.
		PDFJS.getDocument({data: pdfData}).then(function getPdfHelloWorld(pdf) {

			pdf.getPage( page ).then(function getPageHelloWorld(page) {
				var scale = 1.5;
				var viewport = page.getViewport(scale);

				// Prepare canvas using PDF page dimensions.
				var context = canvas.getContext('2d');
				canvas.height = viewport.height;
				canvas.width = viewport.width;

				// Render PDF page into canvas context.
				var renderContext = {
					canvasContext: context,
					viewport: viewport
				};
				page.render(renderContext);
			});
		});
	}

	return {
		showPDFFromBase64: showPDFFromBase64
	};

}