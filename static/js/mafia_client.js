try{
	socket.on('mafia_start', function(){
		printmsg(false, 'got that mafia event');
	});

    socket.on
}
finally{
	
}

function to_night(){
	ele('chat_div').removeClass('day');
	ele('chat_div').fadeColorTo('background-color', 
						[254,254,254], 
						[35,35,35], 
						4000, 
						function(){});
	ele('chat_div').fadeColorTo('color', 
						[35,35,35], 
						[254,254,254], 
						4000, 
						function(){
							ele('chat_div').addClass('night');
						});
}

function to_day(){
	ele('chat_div').removeClass('night');
	ele('chat_div').fadeColorTo('background-color', 
						[35,35,35], 
						[254,254,254], 
						4000, 
						function(){});
	ele('chat_div').fadeColorTo('color', 
						[254,254,254], 
						[35,35,35], 
						4000, 
						function(){
							ele('chat_div').addClass('day');
						});
}
