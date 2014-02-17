

(function() {
	function MafiaGame(){
		this.players = [];
		this.round = 0;
	}
	
	function Player(nick, skey, role, vote){
		this.nick = nick;
		this.skey = skey;
		this.role = role;
		this.alive = true;
	}
})();


m = new MafiaGame();

exports.room_type = 'mafia';
exports.funcs = [
	{
		event_name: 'test',
		func: function (sock){
			sock.emit('mafia_start');
		}
	},
	{
		event_name: 'join',
		func: function(sock){
			this.players.push(sock.sedata.nick);
		}
	}
];
