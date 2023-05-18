<?php
require_once("SpatialData.php");

class CSM extends SpatialData
{
  function __construct()
  {
    $this->connection = pg_connect("host=db port=5432 dbname=CSM_db user=webonly password=scec");
    if (!$this->connection) { die('Could not connect'); }
  }

  public function search($type, $criteria="")
  {
    $query = "";
    if (!is_array($criteria)) {
      $criteria = array($criteria);
    }
    $error = false;

    switch ($type) {
      case "latlon":

//XXX  need to get the dataset name

        if (count($criteria) !== 4) {
          $this->php_result = "BAD";
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


        $query = "SELECT gid FROM XXX_tb WHERE ST_Contains(ST_MakeEnvelope( $1, $2, $3, $4, 4326), XXX_tb.geom)";
        $data = array($minlon, $minlat, $maxlon, $maxlat);
        $result = pg_query_params($this->connection, $query, $data);

        $csm_result = array();

        while($row = pg_fetch_object($result)) {
          $csm_result[] = $row;
        }

        $this->php_result = $csm_result;
        return $this;
        break;

      }
      $this->php_result = "BAD";
      return $this;
  }
}
