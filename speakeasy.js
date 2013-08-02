
var express = require('express')
	, http = require('http')
	, fs = require('fs')
	, crypto = require('crypto')
	, redis = require('redis')
	, rand_str = require('randomstring')
	, rclient = redis.createClient();
 

var app = express();
app.set('domain', 'saddlecat.dopetank.net')
app.set('port', 8080)
var server = app.listen(8080);
var io = require('socket.io').listen(server);


app.use(express.static(__dirname + '/static'));
 
app.get('/', function(req, res){
	fs.readFile(__dirname+'/client.html',
	function (err, data){
		if(err) {
			res.writeHead(500);
			return res.end('Error loading client');
		}
		res.writeHead(200);
		res.end(data);
	})
});
app.configure('development', function(){
  app.use(express.errorHandler());
});

clients = []
in_game = false;

const USER_CONNECTED = 1;
const USER_AUTHED = 2

io.sockets.on('connection', function (sock){
	
	clients[sock.id] = {}

	sock.on('username', function(data){
		clients[sock.id].nick = data;
		clients[sock.id].status = USER_CONNECTED;
		clients[sock.id].authed = false;
		console.log('got user '+data)
		console.log('exists: '+ rclient.hexists('users', data))
		rclient.hexists('users', data, function(err, rep){
			console.log('users['+data+'] exists => '+ rep)
			if(rep===1){
				sock.emit('exists');
			}
			else{
				sock.emit('newuser', data);
			}
		});
	});

	sock.on('newpass', function(data){
		nick = clients[sock.id].nick;
		rclient.hset('users', nick, data)
		clients[sock.id].status = USER_AUTHED;
		sock.emit('startload')
		load_new_user(nick, sock);
		sock.emit('loaded')
	});

	sock.on('pass', function(data){
		nick = clients[sock.id].nick;
		hash = crypto.createHash('md5').update(data).digest("hex")
		rclient.hmset('users', hash, function(){
			clients[sock.id].status = USER_AUTHED;
			sock.emit('startload');
			load_new_user(nick, sock);
			sock.emit('loaded')
		});
	});

	sock.on('chat', function(data){
		if(in_game){
			//pass to game logic to see who gets the message
		}
		//everyone
		io.sockets.emit('chat', {uid: sock.id, msg: data});
	});

	sock.on('action', function(data){
		if(in_game){
			//see above
		}
		io.sockets.emit('action', {uid: sock.id, msg: data});
	});

	sock.on('disconnect', function(){
		console.log('disconnection: '+sock.id)
		io.sockets.emit('part', {uid: sock.id});
		delete clients[sock.id];
	});
	sock.emit('ready');
});


function load_new_user(nick, sock){
	color_class = "c"+ rand_str.generate(4);
	clients[sock.id].color_class = color_class;
	color_data = random_color();
	clients[sock.id].color_data = color_data;
	contrast_color = parseInt(color_data, 16) > 0xFFFFFF/2 ? '000000' : 'ffffff';
	clients[sock.id].contrast_color = contrast_color;
	//send new user to all clients
	io.sockets.emit('colorcls', {
		classname: color_class, 
		color: color_data,
		contrast: contrast_color
	});
	io.sockets.emit('join', { 
		uid: sock.id,
		nick: nick,
		classname: color_class,
		status: clients[sock.id].status
	});

	for (var key in clients){
		//catch new client up on existing users
		if (sock.id == key) continue;
		sock.emit('colorcls',{
			classname: clients[key].color_class, 
			color: clients[key].color_data,
			contrast: clients[key].contrast_color
		});
		sock.emit('join', { 
			uid: key,
			nick: clients[key].nick,
			classname: clients[key].color_class,
			status: clients[key].status
		});
	};
}

function random_color(){
	c = Math.floor(Math.random()*16777215).toString(16);
	if(c.length < 6){
		return "0"+c;
	}
	else{
		return c;
	}
}


