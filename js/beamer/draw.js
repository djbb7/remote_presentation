var drawModule = function( canvas ) {

    var ctx = canvas.getContext('2d');

    var isDrawing = false;

    var fillColor = "#FF0000";

    var points = [];

    draw = function(type, x, y) {
        switch (type) {
            case 's':
                ctx.beginPath();
                ctx.moveTo(x*canvas.width/100, y*canvas.height/100);   
            break;
            case 'm':
                ctx.lineTo(x*canvas.width/100, y*canvas.height/100);
                ctx.strokeStyle = fillColor;
                ctx.lineCap = "round";
                ctx.stroke();
            break;
            case 'e':
            break;
        }
    }

    return {
        draw: draw
    }
}