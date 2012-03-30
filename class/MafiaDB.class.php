<?php
class MafiaDB{
	private $link;
	
	private $secret = "28ffvvn1oovj9583GAEVUIONIOERGQlfjlkyesiwillovooq222qpeemmvdDDdDdDmodib9434oo";
	
	private $saltchars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	
	public function MafiaDB(){
		$this->link = mysql_connect('localhost', 'mafia', '!M4F14_H4X!') or die('Could not connect to mysql: ' . mysql_error());
		$this->db_log("Connected to Database");
		mysql_select_db('mafia') or die("Couldn't select database.");
	}



/*
	database schema
	
	CREATE DATABASE mafia;
	
	SELECT mafia;
	
	SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
	
	CREATE TABLE `user` (
		`id` int(11) NOT NULL AUTO_INCREMENT,
		`name` varchar(30) NOT NULL,
		`salt` varchar(100) NOT NULL,
		`hash` varchar(100) NOT NULL,
  		`status` tinyint(4) DEFAULT NULL,
		`sockid` varchar(100) DEFAULT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;	
	
	CREATE TABLE `log` (
		`id` int(11) NOT NULL AUTO_INCREMENT,
		`type` tinyint(4) NOT NULL,
		`timestamp` datetime NOT NULL,
		`data` varchar(1000) NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
	
	CREATE TABLE `winloss` (
		`id` int(11) NOT NULL AUTO_INCREMENT,
		`outcome` tinyint(4) NOT NULL,
		`timestamp` datetime NOT NULL,
		`winners` varchar(1000) NOT NULL,
		PRIMARY KEY(`id`)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;
*/

	public function checkUserName($client, $name){
		$query = sprintf("SELECT * FROM user WHERE name = '%s' LIMIT 1",
			mysql_real_escape_string($name));
		$result = mysql_query($query, $this->link) or db_error("Error querying for user: ".mysql_error());
		if($row = mysql_fetch_array($result)){
			$this->db_log("Existing User: ".$name);
			$client->setSalt($row["salt"]);
			$client->setHash($row["hash"]);
			$client->setUsername($row["name"]);
			$client->setDatabaseId($row["id"]);
		}
		else{
			$this->db_log("New User: ".$name);
			$client->setUsername(mysql_real_escape_string($name));
		}
	}
	public function newUser($client, $newpass){
		$newsalt = $this->random_salt();
		$query = sprintf("INSERT INTO user (name,salt,hash) VALUES ('%s','%s',sha1('%s%s%s'))",
			$client->getUsername(),
			$newsalt,
			$this->secret, mysql_real_escape_string($newpass), $newsalt);
		mysql_query($query, $this->link) or client_fail($client); 
	}	

	public function checkPass($client, $pass){
		if(sha1($this->secret.$pass.$client->getSalt()) == $client->getHash()){
			$this->db_log($client->getUsername()." Authenticated");
			return true;
		}
		else{
			$this->db_log($client->getUsername()." failed authentication. ");
			$client->setUsername(NULL);
			$client->setHash(NULL);
			$client->setSalt(NULL);
			$client->setDatabaseId(NULL);
			return;
		}
		
	}
	public function random_salt($length = 8){
		$salt = "";
		for($i = 0; $i < $length; $i++){
			$salt .= $this->saltchars[mt_rand(0,strlen($this->saltchars)-1)]; 
		}
		return $salt;
	}
	
	private function client_fail($client){
		$this->db_error("Error creating new user:".$user->name." Reason: ".mysql_error());
		$client->setUsername(NULL);
	}
	private function db_log($msg){
		echo $msg."\n";
	}
	private function db_error($msg){
		echo $msg."\n";
	}
}
?>