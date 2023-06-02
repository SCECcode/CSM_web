<?php
require_once("CSM.php");

$csm = new CSM();

$type = $_REQUEST["t"];
$spec = json_decode($_REQUEST["s"]);
$criteria = json_decode($_REQUEST["q"]);

//$type = 'faultname';
//$criteria = array();
//array_push($criteria, 'Almanor');

if (is_object($criteria[0])) { $criteria = (array)$criteria[0]; }
if (is_object($spec[0])) { $spec = (array)$spec[0]; }

//print_r($spec);exit;
//print_r($criteria);exit;

if ($criteria === []) {

  try {
    print $csm->searchForAll($type, $spec)->outputJSON();
  } catch (BadFunctionCallException $e) {
    print "csm search error";
  }

} else {
  try {
    print $csm->search($type, $spec, $criteria)->outputJSON();
  } catch (BadFunctionCallException $e) {
    print "csm search error";
  }
}
