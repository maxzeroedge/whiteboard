var server = require('http').createServer().listen(5000, function(){console.log('Socket Server on 5000..');});
//require('http').createServer(require('express')());//app.createServer().listen();
var io = require('socket.io').listen(server);
var debug = require('debug');
var time = new Date().getTime();
var users = [];
var chats = [];

io.on('connection', function(socket){
	console.log('Socket Connection Established');
	socket.on('user-connect', function(data){
		console.log(data.user + ' connected');
		users.push(data.user);
		chats = (typeof(chats.length) === 'undefined') ? "" : chats;
		if(users.length > 1){socket.emit('init-load', {"users":users, "chats":chats});}
		socket.broadcast.emit('user-connect', data);
	});	
	socket.on('user-disconnect', function(data){
		for(var i = 0; i < users.length; i++){if(users[i] == data.user){users.splice(i, 1);}}
		socket.broadcast.emit('user-disconnect', data);	
	});
	socket.on('wb-data', function(data){
		socket.emit('wb-data', data);
	});
	socket.on('chat-data', function(data){
		chats.push(data);
		socket.broadcast.emit('chat-data', data);
	});
	socket.on('video-data', function(data){
		socket.broadcast.emit('video-data', data);
	});
	socket.on('files', function(data){
		socket.emit('files', data);
	});
});

//var data2 = JSON.parse(data.toString());
//console.log(data);
//data = data.toString();
/* var t = new Date().getTime() - time;
time = new Date().getTime();
console.log('video data received '+ t); */
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