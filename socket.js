var server = require('http').createServer().listen(1337, function(){console.log('Socket Server on 1337..');});
//require('http').createServer(require('express')());//app.createServer().listen();
var io = require('socket.io').listen(server);
var debug = require('debug');
var time = new Date().getTime();

io.on('connection', function(socket){
	console.log('Socket Connection Established');
	socket.on('user-connect', function(data){
		//data = JSON.parse(data.toString());
		console.log(data.user + ' connected');
		socket.broadcast.emit('user-connect', data);
	});	
	socket.on('user-disconnect', function(data){
		socket.emit('user-disconnect', data);	
	});
	socket.on('wb-data', function(data){
		socket.emit('wb-data', data);
	});
	socket.on('chat-data', function(data){
		socket.emit('chat-data', data);
	});
	socket.on('video-data', function(data){
		//var data2 = JSON.parse(data.toString());
		//console.log(data);
		//data = data.toString();
		/* var t = new Date().getTime() - time;
		time = new Date().getTime();
		console.log('video data received '+ t); */
		socket.broadcast.emit('video-data', data);
	});
	socket.on('files', function(data){
		socket.emit('files', data);
	});
});
/* io.on('user-connect', function(data){
	//data = JSON.parse(data.toString());
	console.log(data);
	debug(data.name + ' connected');
	socket.broadcast.emit('user-connect', data);
});	
io.on('user-disconnect', function(data){
	socket.emit('user-disconnect', data);	
});
io.on('wb-data', function(data){
	socket.emit('wb-data', data);
});
io.on('chat-data', function(data){
	socket.emit('chat-data', data);
});
io.on('video-data', function(data){
	socket.emit('video-data', data);
});
io.on('files', function(data){
	socket.emit('files', data);
}); */