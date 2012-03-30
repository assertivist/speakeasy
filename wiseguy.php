#!/php -q
<?php  /*  >php -q wiseguy.php  */
date_default_timezone_set('America/Chicago');
include 'colors.php';
require_once 'class/MafiaDB.class.php';  
require_once 'class/MafiaClient.class.php';
require_once 'class/MafiaServer.class.php';


error_reporting(E_ALL);
set_time_limit(0);
ob_implicit_flush();

$debug   = true;
$motd	 = "YOU HAVE ENTERED THE MAFIADOME";


$master  = new MafiaServer("0.0.0.0", 31157, $debug);
$master->db = new MafiaDB();
$master->colors = $colors;
$master->setMOTD($motd);
$master->run();

?>
