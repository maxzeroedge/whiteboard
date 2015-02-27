var startX = -1;
var startY = -1;
var endX = -1;
var endY = -1;
var startMotion = 0;
var lineThickness = 1;

function initPaintApp(){
	document.getElementById("lineThickness").onchange = function(){lineThickness = document.getElementById("lineThickness").value};

	var cnvs = document.getElementById("whiteBoard");
	var ctx = cnvs.getContext("2d");

	cnvs.width = 0.72*document.documentElement.clientWidth;
	cnvs.height = 0.9*document.documentElement.clientHeight;

	ctx.fillStyle = "#000000";
	ctx.fillRect(0,0,cnvs.width,cnvs.height);

	//console.log(cnvs.offsetLeft + " " + cnvs.offsetTop);
	cnvs.onmousedown = function(e){
		startX = e.screenX - cnvs.offsetLeft; startY = fixPageXY(e).y - cnvs.offsetTop; startMotion = 1;
		//console.log("Start: "+ startX + " " + startY);
	};

	cnvs.onmousemove = function(e){showTrail(e, cnvs, ctx);}

	cnvs.onmouseup = function(e){
		if(startX > 0 && startY > 0){
			startX = startY = -1; startMotion = 0;
		}
	}
}

function fixPageXY(e) {
  var clickX; var clickY;
  if (e.pageX == null && e.clientX != null ) { 
    var html = document.documentElement
    var body = document.body

    clickX = e.clientX + (html.scrollLeft || body && body.scrollLeft || 0)
    clickX -= html.clientLeft || 0
    
    clickY = e.clientY + (html.scrollTop || body && body.scrollTop || 0)
    clickY -= html.clientTop || 0
  }
  else{
  	clickY = e.pageY; clickX = e.pageX;
  }
  return {x: clickX, y: clickY};
}

function getElementPos(element){
	var pos_x; var pos_y;
	while(element) {
        pos_x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        pos_y += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
	return {x: pos_x, y: pos_y};
}

function showTrail(e, cnvs, ctx){
	if(startMotion == 1){
		endX = e.screenX - cnvs.offsetLeft; endY = fixPageXY(e).y - cnvs.offsetTop;
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = lineThickness;
		ctx.stroke();
		startX = endX; startY = endY;
	}
}
