<?php

class MafiaClient {
	private $id;
	private $socket;
	private $handshake;
	private $pid;
	
	private $uname = NULL;
	private $hash = NULL;
	private $salt = NULL;
	private $dbid = NULL;
	private $ustatus = NULL;
	private $color_class = NULL;
	private $color_data = NULL;
	
	public $role;
	
	public $vote = NULL;
	
	function MafiaClient($id, $socket) {
		$this->id = $id;
		$this->socket = $socket;
		$this->handshake = false;
		$this->pid = null;
	}
	
	public function getId() {
		return $this->id;
	}
	
	public function getSocket() {
		return $this->socket;
	}
	
	public function getHandshake() {
		return $this->handshake;
	}
	
	public function getPid() {
		return $this->pid;
	}
	
	public function getUsername(){
		return $this->uname;
	}
	
	public function getHash(){
		return $this->hash;
	}
	
	public function getSalt(){
		return $this->salt;
	}
	
	public function getDatabaseId(){
		return $this->dbid;
	}
	
	public function getUserStatus(){
		return $this->ustatus;
	}
	
	public function getColorClass(){
		return $this->color_class;
	}
	
	public function getColorData(){
		return $this->color_data;
	}
	
	public function setId($id) {
		$this->id = $id;
	}
	
	public function setSocket($socket) {
		$this->socket = $socket;
	}
	
	public function setHandshake($handshake) {
		$this->handshake = $handshake;
	}
	
	public function setPid($pid) {
		$this->pid = $pid;
	}
	
	public function setUsername($uname){
		$this->uname = $uname;
	}
	
	public function setHash($hash){
		$this->hash = $hash;
	}
	
	public function setSalt($salt){
		$this->salt = $salt;
	}
	
	public function setDatabaseId($dbid){
		$this->dbid = $dbid;
	}
	
	public function setUserStatus($ustatus){
		$this->ustatus = $ustatus;
	}
	
	public function setColorClass($color_class){
		$this->color_class = $color_class;
	}
	
	public function setColorData($color_data){
		$this->color_data = $color_data;
	}
}
class UserStatus{
	const CONNECTED = 1;
	const AUTHED = 2;
	const ALIVE = 3;
	const DEAD = 4;
}
?>