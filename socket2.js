module.exports = exports = socket_server_start;

function socket_server_start(server){
	var io = require('socket.io').listen(server);
	var time = new Date().getTime();
	var users = [];
	var chats = [];

	io.on('connection', function(socket){
		console.log('Socket Connection Established');
		chats = (typeof(chats.length) === 'undefined') ? "" : chats;
		if(users.length > 0){socket.emit('init-load', {"users":users, "chats":chats});}
		socket.on('user-connect', function(data){
			console.log(data.user + ' connected');
			users.push(data.user);
			socket.broadcast.emit('user-connect', data);
		});	
		socket.on('user-disconnect', function(data){
			//for(var i = 0; i < users.length; i++){if(users[i] == data.user){users.splice(i, 1);}}
			socket.broadcast.emit('user-disconnect', data);	
		});
		socket.on('wb-data', function(data){
			socket.broadcast.emit('wb-data', data);
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
}