<?php
error_reporting(E_ALL);
?>
<!DOCTYPE html>
<html>
	<head>
		<title>SPEAKEASY</title>
		<link rel="stylesheet" href="styles/mafia_styles.css" />
		<link href="http://fonts.googleapis.com/css?family=Wire+One" rel="stylesheet" type="text/css">
		<script type="text/javascript" src="js/swfobject.js"></script>
		<script type="text/javascript" src="js/web_socket.js"></script>
		<script type="text/javascript">
			WEB_SOCKET_SWF_LOCATION = "WebSocketMain.swf";
			WEB_SOCKET_DEBUG = true;
		</script>
		
		
		<style type="text/css" id="generated_colors"></style>
	</head>
	<body>
		<div class="login_overlay" id="modal">
			<div class="login_box" id="modalbox">
				<div class="login_title"><span class="second">SPEAKEASY</span></div>
				<div class="login_pane" id="connecting">
					Connecting...<br/><span class="spinner"></span>
				</div>
				<div class="login_pane" id="username">
					Enter name:<br/><input id="in_username" type="text" />
				</div>
				<div class="login_pane" id="new_password">
					Enter new password<br/> for <b><span id="prompted_new_user">nobody</span></b><br/>and confirm:<br/>
					<input id="new_password1" type="password" />
					<input id="new_password2" type="password" />
				</div>
				<div class="login_pane" id="enter_password">
					Enter password for <b><span id="prompted_user"></span></b>:<br/>
					<input id="in_password" type="password" />
				</div>
				<div class="login_pane" id="loading">
					Please wait. <br/> Loading... <br/><span class="spinner"></span>
				</div>
				<div class="login_pane" id="fatal">
					<span class="whoops">&#9760;</span><br/>Fatal error<br/><span id="fatalmessage"></span>
				</div>
				<div class="login_pane" id="no_server">
					The server for this game room is not started.<br/>Please <a href="javascript:location.reload(true);" style="color:inherit;">refresh</a> to check again, or .
				</div>
			</div>
		</div>
		<div class="container">
			<div class="statusbar blackgradient">
				<span class="title">
					SPEAKEASY
				</span>
				<span class="scoreboard">
					<span>Global Stats:</span>
					<span>Civilians&nbsp;<span class="roundedbg red" id="civwins">0</span></span>
					<span>Mafia&nbsp;<span class="roundedbg green" id="mafiawins">0</span></span>
				</span>
				<span class="status">
					<span>You are </span><span id="playerrole" class="roundedbg">disconnected</span>
				</span>
				<span class="userinfo">
					<span>You are logged in as </span>&nbsp;<span id="user">nobody</span>
				</span>
			</div>
			<div class="main">
				<div class="userlist">
					<ul id="players_alive">
						<li class="title">Living players</li>
					</ul>
					<ul id="players_dead">
						<li class="title">Dead players</li>
					</ul>
					<ul id="players_connected">
						<li class="title">Connected Players</li>
					</ul>
				</div>
				<div class="chat">
					<dl id="chat_dl">
						
					</dl>
				</div>
			</div>
			<div class="toolbar blackgradient">
				<div id="game_day">Pregame</div>
				<div id="controls">
					<input id="in_chat" type="text" placeholder="Chat"/>
					<div id="round_number">
				
					</div>
				</div>
				
			</div>
		</div>
		<script type="text/javascript" src="js/mafia.js"></script>
		<script type="text/javascript">
			TheMafia = new MCI();
		</script>
	</body>
</html>
