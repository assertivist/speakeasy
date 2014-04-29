class LynchVote
	constructor: (@votes) ->
		t_tally = {}
		for v in @votes
			if v of t_tally
				t_tally[v] += 1
			else
				t_tally[v] = 1
		presort = ([key, value] for key, value of t_tally)
		@tally = presort.sort (a, b) -> b[1] - a[1]

	most_common: (count) -> 
		return ([@tally[t][0], @tally[t][1]] for t in [0..count-1])

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
		@investigated = false
		@game_running = false
		@last_frame = 0
		@last_voted = 0
		@warned = False

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

	progress: () ->
		if @time == "PM"
			#pass
		else
			quorum = [p.vote for p in @players when p.vote != False and p.alive]
			voting = [p for p in self.players when p.alive]
			tally = new LynchVote(quorum)
			winners = tally.most_common(2)

			tie = false
			if winners.length > 1
				tie = (winners[0][1] == winners[1][1])

			if !tie and winners.length > 0
				@will_be_lynched = winners[0][0]

			if(quorum.length < voting.length):
				return true
			else if @last_frame - @last_voted < 15
				if not @warned
					if not tie
						# "x will be killed!"
					else
						# "no one will be killed"
					# send warning
					@warned = true
			else
				# go to PM

				# send vote results

				if tie
					# there was a tie!
				else if tally.most_common(1)[0][1] < voting.length/2.0
					# failed to get a majority
				else
					lynched = tally.most_common(1)[0][0]
					# the crowd converges on lynched!
					for p in @players
						if p.nick == lynched
							p.kill
							if p.role == 'mafia'
								@civ_win(p.nick)
							if p.role != 'villager' and @reveal_roles
								# reveal the role
							if p.role == 'villager'
								# not the mafia thats for sure
				@to_be_killed = false
				@to_be_saved = false
				@investigated = false
				for p in @players:
					p.vote = false

				@will_be_lynched = false

				if (p for p in @players when p.alive).length <=2
					mafia = (p for p in @players if p.role == 'mafia')[0]
					@mafia_win(mafia)
			




class Player
	constructor: (@nick, @skey) ->
		@role = 'villager'
		@alive = true
		@vote = false


exports.room_type = 'mafia';
exports.ROLES = [
	{
		role: 'mafia',
		night_input_event: 'who_kill'
	},
	{
		role: 'doctor',
		night_input_event: 'who_save'
	},
	{
		role: 'detective',
		night_input_event: 'who_investigate'
	}
]
exports.bootstrap = (socks)->
	@m = new MafiaGame(socks, this.ROLES);

exports.update_loop = (frame)->
	@m.progress
	@last_frame = frame
	@m.last_frame = frame

exports.funcs = [
	{
		event_name: 'test',
		func: (sock,d) ->
			sock.emit('mafia_start')
	},
	{
		event_name: 'join_game',
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
			if !p or !p.alive or sock.se_data.nick == d or p.role != 'mafia'
				sock.emit('kill_refuse')
			else
				@m.to_be_killed = d
				sock.emit('kill_accepted')
	},
	{
		event_name: 'save',
		func: (sock,d) ->
			p = m.p_by_nick(d)
			if !p or !p.alive or sock.se_data.nick == d or p.role != 'doctor'
				sock.emit('save_refuse')
			else
				@m.to_be_saved = d
				sock.emit('save_accepted')
	},
	{
		event_name: 'investigate',
		func: (sock,d) ->
			p = @m.p_by_nick(d)
			if !p or !p.alive or sock.se_data.nick == d or p.role != 'detective'
				sock.emit('investigate_refused')
			else
				sock.emit('investigate_result', p.role == 'mafia')
				@m.investigated = true
	},
	{
		event_name: 'day_vote',
		func: (sock,d) ->
			p = @m.p_by_nick(d)
			if !p or !p.alive or sock.se_data.nick == d
				sock.emit('day_vote_refused')
			else
				player_that_voted = @m.p_by_nick(sock.se_data.nick)
				player_that_voted.vote = d
				@m.last_voted = @last_frame

	}
];
exports.LynchVote = LynchVote