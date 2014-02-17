

class MafiaGame
	constructor: (@all_socks, @enabled_roles) ->
		@players = []
		@role_idx = {}
		@round = 0
		@time = 'PM'
		@pizza = false
		@start_phase = false
		@game_running = false
		#role state data
		@to_be_killed = false
		@to_be_saved = false

	p_by_nick: (nick) ->
		res = (p for p in m.players when p.nick is nick)
		if res.length < 1
			return false
		else return res[0]
	
	assign_roles: () ->
		pick = (role) ->
			pool = i for p,i in @players when p.role = 'villager'
			pidx = pool[Math.floor(Math.random() * pool.length)]
			@players[pidx].role = role
			@players[pidx].sock.emit('role', role)
			@role_idx[role] = pidx
		pick rdata.role for rdata in @enabled_roles
		if @pizza
			pick 'pizza'

	night: () ->
		ALL_SOCKS.emit 'night'
		night_task = (rdata)->
			if rdata.role of @role_idx and @players[@role_idx[rdata.role]]
				r_player = @players[@role_idx[rdata.role]]
				if r_player.alive
					r_player.sock.emit(rdata.night_input_event)
		night_task rdata for rdata in @enabled_roles




class Player
	constructor: (@nick, @skey) ->
		@role = 'villager'
		@alive = true
		@vote = false



exports.room_type = 'mafia';
exports.ROLES = [
	{
		role: 'mafia',
		night_input_event: 'whokill'
	},
	{
		role: 'detective',
		night_input_event: 'whoinvestigate'
	},
	{
		role: 'doctor',
		night_input_event: 'whosave'
	}
]
exports.bootstrap = (socks)->
	@m = new MafiaGame(socks, this.ROLES);
exports.funcs = [
	{
		event_name: 'test',
		func: (sock,d) ->
			sock.emit('mafia_start')
	},
	{
		event_name: 'join',
		func: (sock,d) ->
			if @m.start_phase
					@m.players.push(
						new Player(sock.sedata.nick, sock.id)
					)
	},
	{
		event_name: 'secret_enable_pizza',
		func: (sock,d) ->
			@m.pizza = d == 'true'
	},
	#role events
	{
		event_name: 'kill',
		func: (sock,d) ->
			p = @m.p_by_nick(d)
			if !p or !p.alive or sock.se_data.nick == d
				sock.emit('kill_refuse')
			else
				@m.to_be_killed = d
				sock.emit('kill_accepted')
	},
	{
		event_name: 'save',
		func: (sock,d) ->
			p = m.p_by_nick(d)
			if !p or !p.alive or sock.se_data.nick == d
				sock.emit('save_refuse')
			else
				@m.to_be_saved = d
				sock.emit('save_accepted')
	},
	{
		event_name: 'investigate',
		func: (sock,d) ->
			p = @m.p_by_nick(d)
			if !p or !p.alive or sock.se_data.nick == d
				sock.emit('investigate_refused')
			else
				sock.emit('investigate_result', p.role == 'mafia')
	}
];
