/* code considered (c) Anonymous (Orphan Public Domain) */
	var debug_mode = true;
	//local
	//var host = "ws://localhost:32402/wiseguy.php";
	//ravaged universe
	var host = "ws://mafia.ravageduniverse.com:32402";
	var username = "";
	var socket;
	var loggedin = false;
	var quitting = false;
	var loading = false;
	
	//function MCI() { //The Mafia Client Instance
		if(!WebSocket){ 
			fail("You need a browser with WebSockets<br/>Firefox 10 or Chrome 16");	
			//what
		}
		//return this;
		
		try{
			socket = new WebSocket(host);
			debug('socket status: '+socket.readyState);
			socket.onopen = function(msg){ 
				debug("socket open: "+this.readyState);
				show_login_pane("username");
				ele("in_username").focus();
			};
			socket.onmessage = function(msg){
				var pktarray = msg.data.split('~');
				var action = pktarray[0];
				var data = pktarray[1];
				switch(action){
					case "exists":
						debug("user exists");
						show_login_pane("enter_password");
						ele("in_password").focus();
						break;
					case "newuser":
						debug("new user");
						ele("prompted_new_user").innerHTML = data;
						show_login_pane("new_password");
						ele("new_password1").focus();
						break;
					case "colorcls":
						debug("color class: "+data);
						var cssE = ele("generated_colors");
						if(cssE.styleSheet){
							cssE.styleSheet.cssText += "\n "+data;
						}
						else{
							cssE.appendChild(document.createTextNode("\n "+data));
						}
						break;
					case "join":
						debug("join: "+data);
						var userd = data.split(" ");
						addUpdateUser(userd);
						if(!loading) printmsg(false, "Joined: "+userd[1]);
						break;
					case "part":
						debug("part: "+data);
						var userli = ele("userli_"+data);
						if(userli && !loading){
							printmsg(false, "Parts: "+ele("usersp_"+data).innerHTML);
							userli.parent.removeChild(userli);
						}
						break;
					case "stats":
						debug("stats: "+data);
						var statsd = data.split(":");
						ele("civwins").innerHTML = statsd[0];
						ele("mafiawins").innerHTML = statsd[1];
						ele("round_number").innerHTML = "Round #"+(parseInt(statsd[0],10)+parseInt(statsd[1],10)+1);
						break;
					case "server":
						debug("server: "+data);
						printmsg(false,data);
						break;
					case "startload":
						debug("startload");
						loading = true;
						loggedin = true;
						break;
					case "loaded":
						debug("loaded");
						loading = false;
						username = ele("in_username").value;
						ele("user").innerHTML = username;
						ele("playerrole").innerHTML = "not playing";
						hide_login_pane();
						break;
					case "action":
						debug("action: "+data);
						break;
					case "chat":
						debug("chat: "+data);
						var chatd = data.split("^:");
						printmsg(chatd[0],chatd[1]);
						break;
					case "reauth":
						debug("reauth");
						clearlogin();
						username = "";
						show_login_pane("username");
						break;
					default:
						debug("received scary message: "+msg.data);
						break;
				}
			};
			socket.onclose = function(msg){
				debug("socket closed: "+this.readyState);
				if(!quitting && loggedin){
					fail("Disconnected from the server. "+this.readyState); 
				}
				else if(!loggedin){
					show_login_pane("no_server");
				}
			};
			window.onkeydown = function(event){
				var keycode = ('which' in event) ? event.which : event.keyCode;
				if(keycode === 13){
					//enter key pressed
					switch(document.activeElement.getAttribute("id")){
						case "in_username":
							show_login_pane("loading");
							sendpacket("username", ele("in_username").value);
							break;
						case "new_password1":
						case "new_password2":
							show_login_pane("loading");
							var pass1 = ele("new_password1");
							var pass2 = ele("new_password2");
							if(pass1.value !== pass2.value){
								pass1.hilite();
								pass2.hilite();
								break;
							}
							sendpacket("newpass", ele("new_password2").value);
							break;
						case "in_password":
							show_login_pane("loading");
							sendpacket("pass", ele("in_password").value);
							break;
						case "in_chat":
							var msg = ele("in_chat").value;
							ele("in_chat").value = "";
							sendpacket("chat", msg);
							break;
					}
				}
			};
		}
		catch(ex){
			debug(ex);
			//return null;
		}
	function clearlogin(){
		ele("in_username").value = "";
		ele("new_password1").value = "";
		ele("new_password2").value = "";
		ele("in_password").value = "";
	}
	function sendpacket(action, data){
		if(!action || !data){
			debug("empty message/action");
		}
		var packet = action+"~"+sescape(data);
		try{
			socket.send(packet);
			debug("sent: "+packet);
		}
		catch(ex){
			debug("failed to send: "+packet);
		}
	}
	function show_login_pane(id){
		ele("modal").show();
		ele("modal").find("login_pane").forEach(function(el){ el.style.display = "none"; });
		ele(id).show();
	}
	function hide_login_pane(){
		ele("modal").hide();
	}
	
	function printmsg(userid,msg){
		var namesp;
		var dt = document.createElement("dt");
		var dd = document.createElement("dd");
		if(!userid){ 
			namesp = document.createElement('span');
			namesp.innerHTML = "***";
			dt.appendChild(namesp);
			dt.className = "server from";
			dd.className = "server message";
		}
		else{
			namesp = ele('usersp_'+userid).cloneNode(true);
			namesp.setAttribute("id","");
			dt.appendChild(namesp);
			dt.className = "user from";
			dd.className = "user message";
		}
		dd.innerHTML = msg;
		ele("chat_dl").add([dt,dd]);
	}
	
	function addUpdateUser(userd){
		var userli = document.createElement("li");
		var namesp = document.createElement("span");
		var existing = ele("userli_"+userd[0]);
		if(existing) {
			userli = existing;
			existing.parent.removeChild(existing);
		}
		userli.setAttribute('id', "userli_"+userd[0]);
		userli.className = "user";
		namesp.className = "roundedbg "+userd[2];
		namesp.innerHTML = userd[1];
		namesp.setAttribute('id', "usersp_"+userd[0]);
		userli.appendChild(namesp);
		switch(parseInt(userd[3],10)){
			case 1:
				break;
			case 2:
				ele("players_connected").add([userli]).show();
				break;
			case 3:
				ele("players_alive").add([userli]).show();
				break;
			case 4:
				ele("players_dead").add([userli]).show();
				break;
			default:
				break;
		}
	}
	
	function updateuserinlist(user,colorcls,votes){
	
	}
	var fail = function(error){
		ele("fatalmessage").innerHTML = error;
		ele("modalbox").addClass("red");
		show_login_pane("fatal");
	};
	
	