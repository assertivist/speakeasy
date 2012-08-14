Speakeasy
=========

This is a project stemming from years of playing the parlor game "Mafia" (also sometimes known as "Werewolf") on IRC. I have rarely been able to convince people to install/run/figure out an IRC client at all, let alone to play a game... hence, a browser based implementation of the game was born! 

About
-----
Speakeasy is written in PHP (persistent server) and JavaScript (on the client). It uses WebSockets extensively and borrows websockets-js to implement a Flash fall-back for browsers that do not have support (lately becoming few and far between). Also included is a half-finished CGI implementation of the server written in C. 

### To run

The game uses MySQL for record-keeping and storing user information.

You shouldn't attempt to run this yet. The code is still very messy. Your PHP must be compiled with socket support, and then you must run the persistent server on the host:


	php -q wiseguy.php
 
Browsing to `client.php` will then attempt to connect to the server and you will be asked for credentials etc.

Contributing
-----------

If you must, you can fork...
