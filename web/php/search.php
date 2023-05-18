<?php
require_once("CSM.php");

$csm = new CSM();

$type = $_REQUEST["t"];
$criteria = json_decode($_REQUEST["q"]);

//$type = 'faultname';
//$criteria = array();
//array_push($criteria, 'Almanor');

if (is_object($criteria[0])) {
     $criteria = (array)$criteria[0];
}

//print_r($criteria);exit;

try {
    print $csm->search($type, $criteria)->outputJSON();
} catch (BadFunctionCallException $e) {
    print "csm search error";
}
