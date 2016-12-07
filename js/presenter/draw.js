var drawModule = function( canvas, send ) {

    var ctx = canvas.getContext('2d');

    var fillColor = "#FF0000";

    var points = [];

    var isActive = false;

    var isDrawing = false;

    // bind mouse events
    canvas.onmousemove = canvas.ontouchmove = function(e) {
        if (!isActive || !isDrawing) {
            return;
        }

        if(!e.pageX || !e.pageY){
            var touch = e.touches[0];
            var x = touch.pageX;
            var y = touch.pageY;
        } else {
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;
        }
        
        ctx.lineTo(x,y);
        ctx.strokeStyle = fillColor;
        ctx.lineCap = "round";
        ctx.stroke();
        send("m",100*x/this.width,100*y/this.height);
    };
    canvas.onmousedown = canvas.ontouchstart = function(e) {
        if (!isActive) {
            return;
        }
        isDrawing = true;
        console.log(typeof e);
        if(!e.pageX || !e.pageY){
            var touch = e.touches[0];
            var x = touch.pageX;
            var y = touch.pageY;
        } else {
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;
        }

        ctx.beginPath();
        ctx.moveTo(x, y);
        send("s",100*x/this.width,100*y/this.height);
    };
    canvas.onmouseup = canvas.ontouchend = function(e) {
        if (!isActive) {
            return;
        }
        isDrawing = false;
    }

    var activate = function(){
        isActive = true;
    }

    var deactivate = function(){
        isActive = false;
    }

    return {
        activate: activate,
        deactivate: deactivate
    }
}