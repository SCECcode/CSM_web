<?php
require_once("SpatialData.php");

class CSM extends SpatialData
{
  function __construct()
  {
    $this->connection = pg_connect("host=db port=5432 dbname=CSM_db user=webonly password=scec");
    if (!$this->connection) { die('Could not connect'); }
  }

  public function searchForRegion($type, $spec="", $criteria="")
  {
    $query = "";

    if (!is_array($spec)) {
      $spec = array($spec);
    }
    if (!is_array($criteria)) {
      $criteria = array($criteria);
    }

    // need to get the dataset, depth, metric
    if (count($spec) !== 3) {
      $this->php_result = "BAD spec";
      return $this;
    }
    list($model_tb, $depth, $metric) = $spec;

    if (count($criteria) !== 4) {
      $this->php_result = "BAD criteria";
      return $this;
    }

    $criteria = array_map("floatVal", $criteria);
    list($firstlat, $firstlon, $secondlat, $secondlon) = $criteria;

    $minlon = $firstlon;
    $maxlon = $secondlon;
    if($firstlon > $secondlon) {
      $minlon = $secondlon;
      $maxlon = $firstlon;
    }

    $minlat = $firstlat;
    $maxlat = $secondlat;
    if($firstlat > $secondlat) {
      $minlat = $secondlat;
      $maxlat = $firstlat;
    }

    $query = "SELECT lat,lon".$metric." from ".$model_tb." WHERE dep = ".$depth;
    $result = pg_query($this->connection, $query);

    print($query);

//        $query = "SELECT gid FROM XXX_tb WHERE ST_Contains(ST_MakeEnvelope( $1, $2, $3, $4, 4326), XXX_tb.geom)";
//        $data = array($minlon, $minlat, $maxlon, $maxlat);
//        $result = pg_query_params($this->connection, $query, $data);

    $csm_result = array();

    while($row = pg_fetch_object($result)) {
          $csm_result[] = $row;
    }

    $this->php_result = $csm_result;
    return $this;
  }


  public function searchForAll($type, $spec="")
  { 

    if (!is_array($spec)) {
      $spec = array($spec);
    }

// need to get the dataset, depth, metric
    if (count($spec) !== 3) {
      $this->php_result = "BAD";
      return $this;
    }

    list($model_tb, $depth, $metric) = $spec;

    $query = "SELECT lat,lon,".$metric." from ".$model_tb." WHERE dep = ".$depth;
    $result = pg_query($this->connection, $query);


    $latlist = array();
    $lonlist = array();
    $vallist = array();

    while($row = pg_fetch_row($result)) {
      array_push($latlist,$row[0]);
      array_push($lonlist,$row[1]);
      array_push($vallist,$row[2]);
    }

    $resultarray = new \stdClass();
    $resultarray->lat = $latlist;
    $resultarray->lon = $lonlist;
    $resultarray->val = $vallist;

    $this->php_result = $resultarray;
    return $this;
  }

  public function getAllMetaData()
  {
    $query = "SELECT * from csm_meta";
	  
    $result = pg_query($this->connection, $query);

    $meta_data = array();

    while($row = pg_fetch_object($result)) {
      $meta_data[] = $row;
    }

    $this->php_result = $meta_data;
    return $this;
  }
}
