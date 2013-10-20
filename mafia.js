
function MafiaGame(){
	this.players = [];
	this.round = 0;
	
}

exports.room_type = 'mafia';
exports.funcs = [
	{
		event_name: 'test',
		func: function (sock){
			sock.emit('mafia_start');
		}
	}
];
