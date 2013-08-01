Speakeasy
=========

This is a project stemming from years of playing the parlor game "Mafia" (also sometimes known as "Werewolf") on IRC. I have rarely been able to convince people to install/run/figure out an IRC client at all, let alone to play a game... hence, a browser based implementation of the game was born! 

About
-----
Speakeasy is written completely in Javascript using node.js on the server.

### To run

node speakeasy.js

The game uses Redis for data storage.
 
Browsing to http://host/ will then attempt to connect to the server and you will be asked for credentials etc.

Other Games
-----------
If you happen to stop by and think, "Oh, I love those parlor games such as Mafia or Thermonuclear War!", be sure to watch for speakeasy to go live out on the internet soon. Mafia and TNW are slated for inclusion but I am completely open to adding more games in the future. The game logic will be modularized so that they can all be plugged into the same system. 
