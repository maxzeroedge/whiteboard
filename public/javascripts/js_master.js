var background = "#000000";
var startX = -1;
var startY = -1;
var endX = -1;
var endY = -1;
var startMotion = 0;
var lineThickness = 1;
var lineColor = "#FFFFFF";
var mode = "write";
var eraserThickness = 5;
var video_on = true;
var boardData = [];
var user = "user"+new Date().getTime();
var users = [];
var socket, ws;
var time = new Date().getTime();

function initPaintApp(){
	var cnvs = document.getElementById("whiteBoard");
	var ctx = cnvs.getContext("2d");
	setDefaults();

	cnvs.width = 0.72*document.documentElement.clientWidth;
	cnvs.height = 0.9*document.documentElement.clientHeight;

	ctx.fillStyle = background;
	ctx.fillRect(0,0,cnvs.width,cnvs.height);

	//console.log(cnvs.offsetLeft + " " + cnvs.offsetTop);
	cnvs.onmousedown = function(e){
		startX = e.screenX - cnvs.offsetLeft; startY = fixPageXY(e).y - cnvs.offsetTop; startMotion = 1;
		//console.log("Start: "+ startX + " " + startY);
	};

	cnvs.onmousemove = function(e){
		if(mode === "write"){showTrail(e, cnvs, ctx);}
		else{eraser(e, cnvs, ctx);}
	}

	cnvs.onmouseup = function(e){
		if(startX > 0 && startY > 0){
			startX = startY = -1; startMotion = 0;
		}
	}
	document.getElementById("lineThickness").onclick = function(){
		if(mode!=="write"){
			// changeProp("mode",mode);
			changeProp("mode","write");
		}
	};
	document.getElementById("lineThickness").onchange = function(){
		if(mode!=="write"){
			// changeProp("mode",mode);
			changeProp("mode","write");
		}
		// changeProp("lineThickness", lineThickness); 
		changeProp("lineThickness", document.getElementById("lineThickness").value); 
	}
	document.getElementById("eraserThickness").onclick = function(){
		if(mode!=="erase"){
			// changeProp("mode",mode);
			changeProp("mode","erase");
		}
	};
	document.getElementById("eraserThickness").onchange = function(){
		if(mode!=="erase"){
			// changeProp("mode",mode);
			changeProp("mode","erase");
		}
		changeProp("eraserThickness", document.getElementById("eraserThickness").value);
	}
	document.getElementById("undoJob").onclick = function(e){undoAction(e);};
}

function setDefaults(){
	changeProp("background", "#000000");
	changeProp("lineThickness",1);
	changeProp("lineColor","#FFFFFF");
	changeProp("mode","write");
	changeProp("eraserThickness",1);
}

function fixPageXY(e) {
  var clickX; var clickY;
  if (e.pageX === null && e.clientX !== null ) { 
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
	document.getElementById("whiteBoard").style.cursor = "";
	ctx.globalCompositeOperation="source-over";
	if(startMotion === 1){
		endX = e.screenX - cnvs.offsetLeft; endY = fixPageXY(e).y - cnvs.offsetTop;
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = lineThickness;
		ctx.stroke();
		addMovtToDataSource([startX, startY, endX, endY]);
		startX = endX; startY = endY;
	}
}

function eraser(e, cnvs, ctx){
	document.getElementById("whiteBoard").style.cursor = "url('../Images/eraser.png'), auto";
	ctx.globalCompositeOperation="source-over";
	if(startMotion === 1){
		endX = e.screenX - cnvs.offsetLeft; endY = fixPageXY(e).y - cnvs.offsetTop;
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.strokeStyle = background;
		ctx.lineWidth = eraserThickness;
		ctx.stroke();
		addMovtToDataSource([startX, startY, endX, endY]);
		startX = endX; startY = endY;
	}
}

function changeProp(prop, val){
	window[prop] = val;
	addPropToDataSource([prop, val]);
	// document.getElementById(prop).value = val;
}

function addMovtToDataSource(args){
	var stamp = new Date().getTime();
	var obj = {};
	obj[stamp] = {"user":user, "startX":args[0], "startY":args[1], "endX":args[2], "endY":args[3]};
	boardData.push(obj);
}

function addPropToDataSource(args){
	var stamp = new Date().getTime();
	var obj = {};
	obj[stamp] = {"user":user, "property":args[0], "value":args[1]};
	boardData.push(obj);
}

function undoAction(e){
	boardData.pop();
	boardData.pop();
	boardData.pop();
	boardData.pop();
	reRender(e);
}

function reRender(){
	var cnvs = document.getElementById("whiteBoard");
	var ctx = cnvs.getContext("2d");
	ctx.clearRect(0,0,cnvs.width, cnvs.height);
	setDefaults();
	ctx.fillStyle = background;
	ctx.fillRect(0,0,cnvs.width,cnvs.height);
	for(var i = 0; i < boardData.length; i++){
		var temp = boardData.slice(i, i+1);
		for(var el in temp[0]){
			if(temp[0][el]["startX"] !== "undefined" && mode==="write"){
				reDraw(ctx, temp[0][el]["startX"], temp[0][el]["startY"], temp[0][el]["endX"], temp[0][el]["endY"], lineColor, lineThickness);
			}
			else if(temp[0][el]["startX"] !== "undefined" && mode==="eraser"){
				reDraw(ctx, temp[0][el]["startX"], temp[0][el]["startY"], temp[0][el]["endX"], temp[0][el]["endY"], background, eraserThickness);
			}
			else{
				window[temp[0][el]["property"]] = temp[0][el]["value"];
				console.log(lineThickness+lineColor);
			}
		}
	}
}

function reDraw(ctx, sx, sy, ex, ey, col, thick){
	ctx.beginPath();
	ctx.moveTo(sx, sy);
	ctx.lineTo(ex, ey);
	ctx.strokeStyle = col;
	ctx.lineWidth = thick;
	ctx.stroke();
}

function hasGetUserMedia(){
	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}


$(document).ready(function(){
	//var socket = io();
	//$('#chat').submit();
	$("#cover input[type='button']").on("click", function(){
		if($("#username").val() == ""){
		}
		else{
			user = $("#username").val();
			$('#cover').css({"display":"none"});
		}
	});
	io_connect();
	initiateVideo();
	$('#next').on('click', function(){
		if(document.getElementById("videoOthers").style.top == "-"+document.getElementById("videoSelf").offsetHeight+"px"){
			document.getElementById("videoOthers").style.left = 0;
		}
	});
	$('#prev').on('click', function(){
		if(document.getElementById("videoOthers").style.left == 0){
			document.getElementById("videoOthers").style.left = document.getElementById("videoSelf").offsetWidth+"px";
		}
	});
	$('#stopVid').on('click', function(){
		video_on = false;
		document.getElementById("videoSelf").style.display = "none";
		document.getElementById("videoOthers").style.left = 0;
		document.getElementById("videoOthers").style.top = 0;
	});
	$("#chat input[type='button']").on("click", function(){
		if($("#chat input[type='text']").val() != ""){
			socket.emit('chat-data', {"user":user, "time":new Date().getTime(), "data":$("#chat input[type='text']").val()});
			$("#chat input[type='text']").val("");
		}
	});
});

function connect() {
	ws = new WebSocket("ws://localhost");
    ws.onopen = function () {
        console.log("About to send data");
        ws.send({'event':'user-connect', 'data':name}); // I WANT TO SEND THIS MESSAGE TO THE SERVER!!!!!!!!
        console.log("Message sent!");
    };

	parseMessage();
	
    ws.onclose = function () {
        // websocket is closed.
        console.log("Connection is closed...");
    };
};

function parseMessage(){
	ws.onmessage = function (evt) {
        var rc_data = evt.data;
		switch(rc_data.event){
			case 'wb-data':
				boardData.push(rc_data.data);
				break;
			case 'chat-data':
				addChat(rc_data.data);
				break;
			case 'video-data':
				displayVideo(rc_data.data);
				break;
			case 'user-connect':
				//User connected
				break;
			case 'user-disconnect':
				//User disconnected
				break;
		}
        console.log("Message received ");
    };
}

function io_connect(){
	socket = io('http://localhost:1337');
	socket.on('connection', function(data){
		//Something
	});
	/* socket.on('video-data', function(data){
		//socket.emit('video-data', data);
		//console.log(data);
		displayVideo(data);
	}); */
	socket.emit('user-connect', {"user":user});
	socket.on('user-connect', function(data){
		if(data.user != user){
			users.push(data.user);
		}
	});
	socket.on('video-data', displayVideo);
	socket.on('chat-data', addChat);
}

function addChat(data){
	while(data){
		var d = data.pop();
		$('#chatbox').append("<span class='chat-item'>"+d.text+"\n<br/>\n<span class='flex'><p>"+d.user+"</p><p>"+d.time+"</p></span></span>");
	}
}

function displayVideo(data){
	/* console.log(new Date().getTime() - time);
	time = new Date().getTime(); */
	if(data.user != user){
		var url = window.URL.createObjectURL(dataURIToBlob(data.data.toString()));
		var img = new Image();
		img.onload = function(){
			document.getElementById("videoOthers").getContext('2d').drawImage(img, 0, 0);
		}
		img.src = url;
	}
}

function initiateVideo(){
	var cnvs = document.getElementById("videoSelf");
	var ctx = cnvs.getContext("2d");
	cnvs.width = document.getElementsByTagName("video")[0].offsetWidth;
	cnvs.height = document.getElementsByTagName("video")[0].offsetHeight;
	//cnvs.style="top:-"+document.getElementsByTagName("video")[0].offsetHeight+"px";
	var cnvs2 = document.getElementById("videoOthers");
	var ctx2 = cnvs.getContext("2d");
	cnvs2.width = cnvs.width;
	cnvs2.height = cnvs.height;
	cnvs2.style.top = "-"+document.getElementById("videoSelf").offsetHeight+"px";
	cnvs2.style.left = document.getElementById("videoSelf").offsetWidth+"px";
	if(!hasGetUserMedia()){alert("No getUserMedia support. Kindly update your browser or use latest version of Chrome.");}
	var errorCallback = function(e){console.log("Error", e);};
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	var hdConstraints = {video:{
		mandatory:{
			minWidth: 1280,
			minHeight: 720
		}
	}, audio: true};
	var vgaConstraints = {video:{
		mandatory:{
			minWidth: 640,
			minHeight: 360
		}
	}, audio: true};
	var boardConstraints = {
	    video: {
	        mandatory: {
	            maxWidth: document.getElementsByTagName('video')[0].offsetWidth,
	            maxHeight: document.getElementsByTagName('video')[0].offsetHeight
	        }
	    }, audio: false
	};//Set audio to true
	//console.log(boardConstraints);
	if(navigator.getUserMedia){
		var video = document.querySelector('video');
	    navigator.getUserMedia(boardConstraints, function (stream) {
			video.src = window.URL.createObjectURL(stream);
			/* video.onloadedmetadata = function(e){
				//Send stream to server
			}; */
		}, errorCallback);
		var timer = setInterval(function(){
			ctx.drawImage(video, 0, 0, cnvs.width, cnvs.height);
			document.getElementsByTagName('video')[0].style.display="none";
			if(video_on){
				var data = cnvs.toDataURL('image/jpeg', 0.8);
				//socket.emit('video-data', {"user":user,"data":dataURIToBlob(data)});
				//socket.emit('user-connect', {"name":user});
				//console.log(roughSizeOfObject(data)/1024);
				//console.log(sizeof(data)/1024); //Using sizeof.js
				socket.emit('video-data', {"user":user,"data":data});		
			}
		}, 40);
	}
}

function dataURIToBlob(dataURI){
	//convert base64/URLEncoded data component to raw binary data held in a string
	var byteString;
	if(dataURI.split(',')[0].indexOf('base64') >= 0){
		byteString = atob(dataURI.split(',')[1]);
	}
	else{
		byteString = unescape(dataURI.split(',')[1]);
	}
	
	//separate out the mime component
	var mimeString = dataURI.split(',')[0].split(':')[1].split(',')[0];
	
	//write the bytes of the string to a typed array
	var ia = new Uint8Array(byteString.length);
	for(var i = 0; i < byteString.length; i++){
		ia[i] = byteString.charCodeAt(i);
	}
	
	return new Blob([ia], {type:mimeString});
}

//http://stackoverflow.com/a/11900218
function roughSizeOfObject( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}