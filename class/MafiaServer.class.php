<?php

class MafiaServer {
	private $address;
	private $port;
	private $master;
	private $sockets;
	private $clients;
	private $verboseMode;
	private $motd;
	public $colors;
	public $db; //MafiaDB
	
	
	/**
	 * Server constructor
	 * @param $address The address IP or hostname of the server (default: 127.0.0.1).
	 * @param $port The port for the master socket (default: 5001)
	 */
	function MafiaServer($address = '127.0.0.1', $port = 5001, $verboseMode = false) {
		$this->console("Server starting...");
		$this->address = $address;
		$this->port = $port;
		$this->verboseMode = $verboseMode;

		// socket creation
		$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
		socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, 1);

		if (!is_resource($socket))
			$this->console("socket_create() failed: ".socket_strerror(socket_last_error()), true);

		if (!socket_bind($socket, $this->address, $this->port))
			$this->console("socket_bind() failed: ".socket_strerror(socket_last_error()), true);

		if(!socket_listen($socket, 20))
			$this->console("socket_listen() failed: ".socket_strerror(socket_last_error()), true);
		$this->master = $socket;
		$this->sockets = array($socket);
		$this->console("Server started on {$this->address}:{$this->port}");
		return $this;
	}
	function gameEvents(){
		if(substr(strval(time()),-3,3) == "000"){	
		
		}	
	}

	/**
	 * add client object
	 * @param $socket
	 */
	private function connect($socket) {
		$this->console("Creating client...");
		$client = new MafiaClient(uniqid(), $socket);
		$this->clients[] = $client;
		$this->sockets[] = $socket;
		$this->console("Client #{$client->getId()} is successfully created!");
	}

	/**
	 * Websockets handshake (Chrome 16+)
	 * @param $client
	 * @param $headers
	 */
	private function handshake($client, $headers) {
		$this->console("Getting client WebSocket version...");
		$this->console($headers);
		//if(preg_match("/Sec-WebSocket-Version: (.*)\r\n/", $headers, $match))
		//	$version = $match[1];
		//else {
		//	$this->console("The client doesn't support WebSocket");
		//	$this->sendPacket($client, "fail", "browser");
		//	return false;
		//}
		
		$this->console("Client WebSocket version is {$version}, (required: 13)");
		//if($version == 13) {
			// Extract header variables
			$this->console("Getting headers...");
			if(preg_match("/GET (.*) HTTP/", $headers, $match))
				$root = $match[1];
			if(preg_match("/Host: (.*)\r\n/", $headers, $match))
				$host = $match[1];
			if(preg_match("/Origin: (.*)\r\n/", $headers, $match))
				$origin = $match[1];
			if(preg_match("/Sec-WebSocket-Key: (.*)\r\n/", $headers, $match))
				$key = $match[1];
			
			$this->console("Client headers are:");
			$this->console("\t- Root: ".$root);
			$this->console("\t- Host: ".$host);
			$this->console("\t- Origin: ".$origin);
			$this->console("\t- Sec-WebSocket-Key: ".$key);
			
			$this->console("Generating Sec-WebSocket-Accept key...");
			$acceptKey = $key.'258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
			$acceptKey = base64_encode(sha1($acceptKey, true));

			$upgrade = "HTTP/1.1 101 Switching Protocols\r\n".
					   "Upgrade: websocket\r\n".
					   "Connection: Upgrade\r\n".
					   "Sec-WebSocket-Accept: $acceptKey".
					   "\r\n\r\n";
			
			$this->console("Sending this response to the client #{$client->getId()}:\r\n".$upgrade);
			socket_write($client->getSocket(), $upgrade);
			$client->setHandshake(true);
			$this->console("Handshake is successfully done!");
			return true;
		//}
		else {
			$this->console("WebSocket version 13 required (the client supports version {$version})");
			$this->sendPacket($client, "fail", "browser");
			return false;
		}
	}

	/**
	 * Disconnect a client and close the connection
	 * @param $socket
	 */
	private function disconnect($client) {
		$this->console("Disconnecting client #{$client->getId()}");
		$i = array_search($client, $this->clients);
		$j = array_search($client->getSocket(), $this->sockets);
		
		if($j >= 0) {
			array_splice($this->sockets, $j, 1);
			socket_close($client->getSocket());
			$this->console("Socket closed");
		}
		
		if($i >= 0)
			array_splice($this->clients, $i, 1);
		$this->console("Client #{$client->getId()} disconnected");
		if($client->getUserStatus() > UserStatus::CONNECTED) $this->sendPacketAll("part",$client->getId());
	}

	/**
	 * Get the client associated with the socket
	 * @param $socket
	 * @return A client object if found, if not false
	 */
	private function getClientBySocket($socket) {
		foreach($this->clients as $client)
			if($client->getSocket() == $socket) {
				$this->console("Client found");
				return $client;
			}
		return false;
	}
	
	
	/**
	 * Run the server
	 */
	public function run() {
		$this->console("Start running...");
		while(true) {
			$changed_sockets = $this->sockets;
			@socket_select($changed_sockets, $write = NULL, $except = NULL, 1);
			if(!isset($changed_sockets)) continue;
			foreach($changed_sockets as $socket) {
				if($socket == $this->master) {
					if(($acceptedSocket = socket_accept($this->master)) < 0) {
						$this->console("Socket error: ".socket_strerror(socket_last_error($acceptedSocket)));
					}
					else {
						$this->connect($acceptedSocket);
					}
				}
				else {
					$this->console("Finding the socket that associated to the client...");
					$client = $this->getClientBySocket($socket);
					if($client) {
						$this->console("Receiving data from the client");
						$bytes = @socket_recv($socket, $data, 2048, MSG_DONTWAIT);
						if(!$client->getHandshake()) {
							$this->console("Doing the handshake");
							if($this->handshake($client, $data))
								//$this->startProcess($client); //what this is stupid
								//$this->processData($client, $data);
								;
						}
						elseif($bytes === 0) {
							$this->disconnect($client);
						}
						else {
							// When received data from client
							$this->processData($client, $data);
						}
					}
				}
			}
			$this->gameEvents();
		}
	}

	
	private function processData($client,$msg){
		$packet = $this->unmask($msg);
		$pck = explode("~",$packet);
	
		$action = $pck[0];
		if(isset($pck[1])) $data = $pck[1];
		else $data = NULL;
  
		$this->console("< ".$packet);
	
		//authentication
		if($client->getUserStatus() < UserStatus::AUTHED){
			switch($action){
				//initial user name recieved
				case "username":
					$unamein = substr($data, 0, 20);
					$this->db->checkUserName($client, $unamein);
					if( $client->getUsername() != NULL
					&&  $client->getHash() != NULL
					&& 	$client->getSalt() != NULL){
						$this->sendPacket($client, "exists");
						break;
					}
					if($client->getUsername() != NULL){
						$this->sendPacket($client, "newuser", $client->getUsername());
						break;
					}
					break;
				//new user, got new password
				case "newpass":
					$newpass = substr($data, 0, 20);
					$this->db->newUser($client, $newpass);
					if($client->getUsername() != NULL){
						$client->setUserStatus(UserStatus::AUTHED);
						$this->sendPacket($client, "startload");
						$this->loadJoinedUser($client);
					}
					else{
						$this->reqAuth($client);
					}
					break;
				//existing user, password received
				case "pass":
					$this->db->checkPass($client, $data);
					if($client->getUsername() != NULL){
						$this->sendPacket($client, "startload");
						$client->setUserstatus(UserStatus::AUTHED);
						$this->loadJoinedUser($client);
					}
					else{
						$this->reqAuth($client);
					}
					break;
				default:
					$this->reqAuth($client);
					break;
			}
			return;
		
		}
 	 
		switch($action){
			case "chat":
				$this->sendChatAll($client, $data, ($client->getUserStatus() == UserStatus::DEAD));
				break;
			case "action":
  				$this->sendActionAll($client, $data, ($client->getUserStatus() == UserStatus::DEAD));
				break;
  			case "vote":
  				break;
  			case "echo":
  				$this->send($client, $data);
  				break;
  			case "part":
  				break;
  			case "exit":
  				$this->console("exited:");
		    default: 
		    	$this->send($client, $action." not understood");
		    	break;
		}
	}
	function loadJoinedUser($newclient){
		$newclient->setColorClass("c".$this->db->random_salt(4));
		$newclient->setColorData($this->colors[array_rand($this->colors)]);

		foreach($this->clients as $c){
			if($c->getUserStatus() < UserStatus::AUTHED) continue;
			//send every user the new user's color
			$this->sendPacket($c, "colorcls", $this->clientColorClass($newclient));
			//send every user the new user joining
			$this->sendPacket($c, "join", sprintf("%s %s %s %s", 
				$newclient->getId(),
				$newclient->getUsername(), 
				$newclient->getColorClass(),
				$newclient->getUserStatus()
			));
			if($newclient->getId() == $c->getId()) continue;
			//send the user everyone else's colors
			$this->sendPacket($newclient, "colorcls", $this->clientColorClass($c));
			//send the user everyone else joining
			$this->sendPacket($newclient, "join", sprintf("%s %s %s %s", 
				$c->getId(),
				$c->getUsername(), 
				$c->getColorClass(), 
				$c->getUserStatus()
			));
		}
		//send the newly joined user some other stuff
		//TODO: real stats 
		$this->sendPacket($newclient, "stats", sprintf("4:5"));
		$this->sendPacket($newclient, "server", sprintf("Welcome to MAFIA HIDEOUT, %s!",$newclient->getUsername()));
		$this->sendPacket($newclient, "server", $this->motd);
		$this->sendPacket($newclient, "loaded");
	}	
	
	/**
	 * packet format
	 * @param $client
	 * @param $message
	 * @param $data = ""
	 */
	function sendPacket($client, $action, $data = ""){
		$packet = $action."~".$data;
		$this->send($client, $packet);
	}

	/**
	 * send chat to all clients, only dead ones if client sending is dead
	 * @param $client
	 * @param $message
	 * @param $deadonly = false
	 */
	private function sendChatAll($client, $message, $deadonly = false){
		$pkt = sprintf("chat~%s^:%s",
			$client->getId(),
			$message);
		foreach($this->clients as $c){
			if($deadonly){
				if(!$client.getUserStatus() == UserStatus::DEAD) continue;
			}
			$this->send($c, $pkt);
		}
	}
	
	/**
	 * send action to all clients, only dead ones if client sending is dead
	 * @param $client
	 * @param $message
	 * @param $deadonly = false
	 */
	private function sendActionAll($client, $message, $deadonly = false){
		$pkt = sprintf("action~%s^:%s",
			$client->getId(),
			$message);
		foreach($this->clients as $c){
			if($deadonly){
				if(!$client->getUserStatus() == UserStatus::DEAD) continue;
			}
			$this->send($c, $pkt);
		}
	}
	
	private function sendPacketAll($action,$message = ""){
		foreach($this->clients as $c){
			$this->send($c, $action."~".$message);
		}
	}
	
	/**
	 * make color class string from color info
	 * @param $client
	 */
	private function clientColorClass($client){
		return sprintf(".%s { background-color: %s; color: #%s; }", $client->getColorClass(), $client->getColorData(), $this->getContrastColor(substr($client->getColorData(),1)));
	}
	
	/**
	 * set motd string
	 * @param $string
	 */
	public function setMOTD($string){
		$this->motd = $string;
	}
	
	/**
	 * require the clien to reauth
	 * @param $client
	 */
	private function reqAuth($client){
		if(isset($client)){
			$client->setUsername(NULL);
			$client->setHash(NULL);
			$client->setSalt(NULL);
			$client->setUserStatus(UserStatus::CONNECTED);
		}
		$this->sendPacket($client, "reqauth");
	}
	

	/**
	 * Send a text to client
	 * @param $client
	 * @param $text
	 */
	private function send($client, $text) {
		try{
			$this->console("Send '".$text."' to client #{$client->getId()}");
			$text = $this->encode($text);
			if(socket_write($client->getSocket(), $text, strlen($text)) === false) {
				$this->console("Unable to write to client #{$client->getId()}'s socket");
				$this->disconnect($client);
			}
		}
		catch(Exception $e){
			$this->console("Failure to send data to client: ".$e->getMessage());
		}
	}

	/**
	 * Encode a text for sending to clients via ws://
	 * @param $text
	 */
	private function encode($text)
	{
		// 0x1 text frame (FIN + opcode)
		$b1 = 0x80 | (0x1 & 0x0f);
		$length = strlen($text);
		
		if($length <= 125)
			$header = pack('CC', $b1, $length);
		elseif($length > 125 && $length < 65536)
			$header = pack('CCS', $b1, 126, $length);
		elseif($length >= 65536)
			$header = pack('CCN', $b1, 127, $length);
		
		return $header.$text;
	}

	/**
	 * Unmask a received payload
	 * @param $buffer
	 */
	private function unmask($payload) {
		$length = ord($payload[1]) & 127;

		if($length == 126) {
			$masks = substr($payload, 4, 4);
			$data = substr($payload, 8);
		}
		elseif($length == 127) {
			$masks = substr($payload, 10, 4);
			$data = substr($payload, 14);
		}
		else {
			$masks = substr($payload, 2, 4);
			$data = substr($payload, 6);
		}

		$text = '';
		for ($i = 0; $i < strlen($data); ++$i) {
			$text .= $data[$i] ^ $masks[$i%4];
		}
		return $text;
	}
	
	/**
	 * Print a text to the terminal
	 * @param $text the text to display
	 * @param $exit if true, the process will exit 
	 */
	private function console($text, $exit = false) {
		$text = date('[Y-m-d H:i:s] ').$text."\r\n";
		if($exit)
			die($text);
		if($this->verboseMode)
			echo $text;
	}
	
	private function getContrastColor($color)
	{
    	return (hexdec($color) > 0xffffff/2) ? '000000' : 'ffffff';
	}
	
	
}
class Game{
	public $players;
	public $day;
	public $votes; 
}
?>
