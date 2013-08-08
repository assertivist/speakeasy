
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

var game = require('./mafia')

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

in_game = false;
game_starting = false;

const USER_CONNECTED = 1;
const USER_AUTHED = 2

io.sockets.on('connection', function (sock){
	
	sock.se_data = {};

	sock.on('message', function(data){
		console.log('testing bind to every message');
	})

	sock.on('username', function(data){
		sock.se_data.nick = data;
		sock.se_data.status = USER_CONNECTED;
		sock.se_data.authed = false;
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
		nick = sock.se_data.nick;
		rclient.hset('users', nick, data)
		sock.se_data.status = USER_AUTHED;
		sock.emit('startload')
		load_new_user(nick, sock);
		sock.emit('loaded')
	});

	sock.on('pass', function(data){
		nick = sock.se_data.nick;
		hash = crypto.createHash('md5').update(data).digest("hex")
		rclient.hmset('users', hash, function(){
			sock.se_data.status = USER_AUTHED;
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
	});

	sock.on('startgame', function(){
		nick = sock.se_data.nick;
		console.log('starting game: '+nick);
		io.sockets.emit('joinphase');
	});

	for(mfunc in game.funcs){
		sock.on(game.funcs[mfunc].event_name, function(d){ game.funcs[mfunc].func(sock); });
	}

	sock.emit('ready');
});


function load_new_user(nick, sock){
	color_class = "c"+ rand_str.generate(4);
	sock.se_data.color_class = color_class;
	color_data = random_color();
	sock.se_data.color_data = color_data;
	contrast_color = parseInt(color_data, 16) > 0xFFFFFF/2 ? '000000' : 'ffffff';
	sock.se_data.contrast_color = contrast_color;
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
		status: sock.se_data.status
	});

	io.sockets.clients().forEach(function(s) {
    	if(sock.id == s.id) return;
    	sock.emit('colorcls',{
			classname: s.se_data.color_class, 
			color: s.se_data.color_data,
			contrast: s.se_data.contrast_color
		});
		sock.emit('join', { 
			uid: s.id,
			nick: s.se_data.nick,
			classname: s.se_data.color_class,
			status: s.se_data.status
		});
	});
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


