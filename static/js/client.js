/* code (c) dopetank software http://dopetank.net */
var debug_mode = true;
var host = "saddlecat.dopetank.net:8080";
var username = "";
var socket;
var loggedin = false;
var quitting = false;
var loading = false;

if(!io){ 
	fail("io failed to load on your client. Please report this incidence and include your browser version.");
}
	
try{
	socket = io.connect(host);
	socket.on('connect', function(msg){ 
		debug("socket open: "+this.readyState);
		show_login_pane("username");
		ele("in_username").focus();
	});

	socket.on("exists", function(){
		debug("user exists");
		show_login_pane("enter_password");
		ele("in_password").focus();
	});
	socket.on("newuser", function(data){
		debug("new user");
		ele("prompted_new_user").innerHTML = data;
		show_login_pane("new_password");
		ele("new_password1").focus();
	});
	socket.on("colorcls", function(data){
		if(!loggedin) return;
		debug("color class");
		debug(data);
		new_css = "."+data.classname+" { background-color: #"+data.color+"; color: #"+data.contrast+"; }";
		var cssE = ele("generated_colors");
		if(cssE.styleSheet){
			cssE.styleSheet.cssText += "\n "+new_css;
		}
		else{
			cssE.appendChild(document.createTextNode("\n "+new_css));
		}
	});
	socket.on("join", function(data){
		if(!loggedin) return;
		debug("join");
		debug(data);
		addUpdateUser(data);
		if(!loading) printmsg(false, "Joined: "+data.nick);
	});
	socket.on("part", function(data){
		if(!loggedin) return;
		debug("part");
		debug(data);	
		var userli = ele("userli_"+data.uid);
		if(userli){
			printmsg(false, "Parts: "+ele("usersp_"+data.uid).innerHTML);
			userli.parentNode.removeChild(userli);
		}
	});
	socket.on("stats", function(data){
		if(!loggedin) return;
		debug("stats: "+data);
		var statsd = data.split(":");
		ele("civwins").innerHTML = statsd[0];
		ele("mafiawins").innerHTML = statsd[1];
		ele("round_number").innerHTML = "Round #"+(parseInt(statsd[0],10)+parseInt(statsd[1],10)+1);
	});
	socket.on("server", function(data){
		debug("server: "+data);
		printmsg(false,data);
	});
	socket.on("startload", function(){	
		debug("startload");
		loading = true;
		loggedin = true;
	});
	socket.on("loaded", function(data){
		debug("loaded");
		loading = false;
		username = ele("in_username").value;
		ele("user").innerHTML = username;
		ele("playerrole").innerHTML = "not playing";
		hide_login_pane();
		ele('in_chat').focus()
		resize_panels();
		window.onresize = resize_panels;
	});
	socket.on("action", function(data){
		if(!loggedin) return;
		debug("action");
		debug(data);
		printmsg(data.uid, data.msg);
	});
	socket.on("chat", function(data){
		if(!loggedin) return;
		debug("chat");
		debug(data);
		printmsg(data.uid, data.msg);
	});
	socket.on("reauth", function(data){
		debug("reauth");
		clearlogin();
		username = "";
		show_login_pane("username");
	});

	socket.on("disconnect", function(msg){
		debug("socket closed: "+this.readyState);
		if(!quitting && loggedin){
			fail("Disconnected from the server. "+this.readyState); 
		}
		else if(!loggedin){
			show_login_pane("no_server");
		}
	});

	window.onkeydown = function(event){
		var keycode = ('which' in event) ? event.which : event.keyCode;
		if(keycode === 13){
			//enter key pressed
			switch(document.activeElement.getAttribute("id")){
				case "in_username":
					show_login_pane("loading");
					uname_e = ele("in_username")
					if (uname_e.value.length < 3
						|| uname_e.value.length > 15){
						uname_e.hilite();
						return;
					}
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
						return;
					}
					sendpacket("newpass", ele("new_password2").value);
					break;
				case "in_password":
					show_login_pane("loading");
					sendpacket("pass", ele("in_password").value);
					break;
				case "in_chat":
					var msg = ele("in_chat").value.trim();
					if(msg.length > 500 || msg.length < 1){
						return;
					}
					ele("in_chat").value = "";
					sendpacket("chat", msg);
					break;
			}
		}
	};
}
catch(ex){
	debug("EXCEPTION");
	debug(ex);
	throw ex;
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
		socket.emit(action, sescape(data));
		//socket.send(packet);
		debug("sent: "+action+ " "+sescape(data));
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
	chat_d = ele("chat_div")
	chat_d.scrollTop = chat_d.scrollHeight;
}
resize_timeout = 0
function resize_panels(){
	clearTimeout(resize_timeout);
	resize_timeout = setTimeout(function(){
		chat_d = ele("chat_div")
		chat_d.scrollTop = chat_d.scrollHeight;
		chat_d.style.height = (window.innerHeight - 100) + "px";
		chat_d.style.width = (window.innerWidth - 225) + "px";
		ele("userlist_div").style.height = (window.innerHeight - 115) + "px";
		console.log("resized")
	}, 250);
}

function addUpdateUser(userd){
	var userli = document.createElement("li");
	var namesp = document.createElement("span");
	var existing = ele("userli_"+userd.uid);
	if(existing) {
		userli = existing;
		existing.parentNode.removeChild(existing);
	}
	userli.setAttribute('id', "userli_"+userd.uid); 
	userli.className = "user";
	namesp.className = "roundedbg "+userd.classname;
	namesp.innerHTML = userd.nick;
	namesp.setAttribute('id', "usersp_"+userd.uid);
	userli.appendChild(namesp);
	switch(parseInt(userd.status,10)){
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

