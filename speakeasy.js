var app = require('http').createServer(handler)
	, io = require('socket.io').listen(app)
	, fs = require('fs')
	, url = require('url')

app.listen(8080);

function handler (req, res) {
	incomingUrl = url.parse(req.url);
	out_f = __dirname;
	base = incomingUrl.pathname.split('/');
	content = 'text/html'
	switch (base[1]){
		case "styles":
			out_f = out_f.concat('/styles/mafia_styles.css');
			break;
		case "script":
			out_f = out_f.concat('/js/mafia.js')
			break;
		case "tools":
			out_f = out_f.concat('/js/tools.js')
			break
		case "img":
			content = 'img/png'
			out_f = out_f.concat("img/"+base[2])
		case "":
		default:
			out_f = out_f.concat('/client.html');
			break;
	}
	console.log(incomingUrl);
	console.log(base);
	console.log(out_f);
	fs.readFile(out_f,
	function (err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}
		res.writeHead(200, {'Content-Type': content});
		res.end(data);
	});
}

io.sockets.on('connection', function (socket){
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
});
