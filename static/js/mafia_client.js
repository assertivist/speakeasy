try{
	socket.on('mafia_start', function(){
		printmsg(false, 'got that mafia event');
	});

	socket.on('who_kill', function(){
		// Get the victim from this player (the mafia)
	});

	socket.on('kill_refuse', function(){
    	// The mafia's kill was invalid.
    });

    socket.on('kill_accept', function(){
    	// Someone's gonna get it
    });

    socket.on('who_save', function(){
    	// Get a patient from this player (the doctor)
    });

    socket.on('save_refuse', function(){
    	// The doctor's save choice was invalid.
    });

    socket.on('save_accepted', function(){
    	// The doctor will attempt to save someone this turn
    });

    socket.on('who_investigate', function(){
    	// Get a suspect from this player (the detective)
    });

    socket.on('investigate_refused', function(){
    	// The detective's choice was invalid.
    });

    socket.on('investigate_result', function(role){
    	// The detective learns something interesting...
    	printmsg(false, "That person is the "+role);
    });
    
    socket.on('day_vote_refused', function(){
    	// the player's lynch vote was invalid.
    });

    socket.on('day_vote_accepted', function(){
    	// the player voted on a lynch successfully
    });
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
