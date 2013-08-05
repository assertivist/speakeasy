exports.funcs = [
	{
		event_name: 'test',
		func: function (sock){
			sock.emit('mafia_start');
		}
	}
];