<?php
require_once("php/navigation.php");
require_once("php/CSM.php");
$header = getHeader("Viewer");

$csm = new CSM();

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Community Stress Model (Provisional)</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/vendor/font-awesome.min.css">
    <link rel="stylesheet" href="css/vendor/bootstrap.min.css">
    <link rel="stylesheet" href="css/vendor/bootstrap-grid.min.css">
    <link rel="stylesheet" href="css/vendor/leaflet.awesome-markers.css">
    <link rel="stylesheet" href="css/vendor/leaflet.css">
    <link rel="stylesheet" href="css/vendor/jquery-ui.css">
    <link rel="stylesheet" href="css/vendor/glyphicons.css">
    <link rel="stylesheet" href="css/vendor/all.css">
    <link rel="stylesheet" href="css/cxm-ui.css?v=1">

    <script type="text/javascript" src="js/vendor/leaflet-src.js"></script>
    <script type='text/javascript' src='js/vendor/leaflet.awesome-markers.min.js'></script>
    <script type='text/javascript' src='js/vendor/popper.min.js'></script>
    <script type='text/javascript' src='js/vendor/jquery.min.js'></script>
    <script type='text/javascript' src='js/vendor/bootstrap.min.js'></script>
    <script type='text/javascript' src='js/vendor/jquery-ui.js'></script>
    <script type='text/javascript' src='js/vendor/ersi-leaflet.js'></script>
    <script type='text/javascript' src='js/vendor/FileSaver.js'></script>
    <script type='text/javascript' src='js/vendor/jszip.js'></script>
    <script type='text/javascript' src='js/vendor/jquery.floatThead.min.js'></script>

    <script type='text/javascript' src='js/vendor/togeojson.js'></script>
    <script type='text/javascript' src='js/vendor/leaflet-kmz-src.js'></script>

    <link rel="stylesheet" href="js/vendor/plugin/Leaflet.draw/leaflet.draw.css">
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/Leaflet.draw.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/Leaflet.Draw.Event.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/Toolbar.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/Tooltip.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/ext/GeometryUtil.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/ext/LatLngUtil.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/ext/LineUtil.Intersect.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/ext/Polygon.Intersect.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/ext/Polyline.Intersect.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/ext/TouchEvents.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/draw/DrawToolbar.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/draw/handler/Draw.Feature.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/draw/handler/Draw.SimpleShape.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/draw/handler/Draw.Polyline.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/draw/handler/Draw.Marker.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/draw/handler/Draw.Circle.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/draw/handler/Draw.CircleMarker.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/draw/handler/Draw.Polygon.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/draw/handler/Draw.Rectangle.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/edit/EditToolbar.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/edit/handler/EditToolbar.Edit.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/edit/handler/EditToolbar.Delete.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/Control.Draw.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/edit/handler/Edit.Poly.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/edit/handler/Edit.SimpleShape.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/edit/handler/Edit.Rectangle.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/edit/handler/Edit.Marker.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/edit/handler/Edit.CircleMarker.js"></script>
    <script type='text/javascript' src="js/vendor/plugin/Leaflet.draw/edit/handler/Edit.Circle.js"></script>

<!-- csm js -->
    <script type="text/javascript" src="js/debug.js?v=1"></script>
    <script type="text/javascript" src="js/csm_main.js?v=1"></script>
    <script type="text/javascript" src="js/csm.js?v=1"></script>
    <script type="text/javascript" src="js/csm_leaflet.js?v=1"></script>
    <script type="text/javascript" src="js/csm_ui.js?v=1"></script>

<!-- pixi pixiOverlay -->
    <script type="text/javascript" src="js/vendor/pixi.js"></script>
    <script type="text/javascript" src="js/vendor/pixiOverlay/L.PixiOverlay.js"></script>
<!--
<script src="https://cdn.jsdelivr.net/npm/leaflet-pixi-overlay@1.9.4/L.PixiOverlay.min.js "></script>
-->
    <script type="text/javascript" src="js/vendor/pixiOverlay/MarkerContainer.js"></script>
    <script type="text/javascript" src="js/vendor/pixiOverlay/bezier-easing.js"></script>
    <script type="text/javascript" src="js/cxm_pixi.js"></script>

<!-- cxm js -->
    <script type="text/javascript" src="js/cxm_kml.js?v=1"></script>
    <script type="text/javascript" src="js/cxm_model_util.js?v=1"></script>
    <script type="text/javascript" src="js/cxm_misc_util.js?v=1"></script>

<!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-495056-12"></script>
    <script type="text/javascript">
        $ = jQuery;
        var tableLoadCompleted = false;
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());

        gtag('config', 'UA-495056-12');

        $(document).on("tableLoadCompleted", function () {
            tableLoadCompleted = true;

         var $result_table = $('#result_table');
            $result_table.floatThead({
                scrollContainer: function ($table) {
                    return $table.closest('div#result-table-container');
                },
            });
        });

    </script>

</head>
<body>
<?php echo $header; ?>

<div class="container main" id="csmMain">

<!-- trace dumping buttons 
    <div style="display:none">
      <button id="dumpMarkerLatlngBtn" class="btn cxm-small-btn" onClick="toFileMarkerLatlng()">
                <span class="glyphicon glyphicon-share"></span> Export Marker Latlng</button>
    </div>
-->

<!-- top-intro -->
   <div id="top-intro" style="display:">
<p>
NEW: The sites of the <a href="https://www.scec.org/research/csm">SCEC Community Stress Model</a> are 
...  See the <a href="guide">user guide</a> for more details and usage instructions.
</p>
   </div>

<!-- leaflet control -->
   <div class="row" style="display:none;">
        <div class="col justify-content-end custom-control-inline">
            <div style="display:none;" id="external_leaflet_control"></div>
        </div>
   </div>

<!-- top-control -->
   <div id="top-control">
      <div id="csm-controls-container" class="row d-flex mb-0" style="display:">

<!-- top-control-row-1 -->
        <div id="top-control-row-1" class="col-12">
        </div> <!-- top-control-row-1 -->

<!-- top-control-row-2 -->
        <div id="top-control-row-2" class="col-12 mb-1" style="border:solid 0px green">

          <div class="row justify-content-end">
            <div id='model-options' class="form-check-inline">
              <div class="form-check form-check-inline">
                <label class='form-check-label ml-1 mini-option'
                               for="cxm-model-cfm">
                <input class='form-check-inline mr-1'
                               type="checkbox"
                      id="cxm-model-cfm" value="1" />CFM6.0
                </label>
              </div>
              <div class="form-check form-check-inline">
                <label class='form-check-label ml-1 mini-option'
                               for="cxm-model-gfm">
                <input class='form-check-inline mr-1'
                               type="checkbox"
                      id="cxm-model-gfm" value="1" />GFM
                </label>
              </div>
            </div>

<!-- KML/KMZ overlay -->
            <div id="kml-row" class="col-2" style="border:solid 0px green">
<div class="row" style="width:20rem;">
              <input id="fileKML" type='file' multiple onchange='uploadKMLFile(this.files)' style='display:none;'></input>
              <button id="kmlBtn" class="btn"
                      onclick='javascript:document.getElementById("fileKML").click();'
                      title="Upload your own kml/kmz file to be displayed on the map interface. We currently support points, lines, paths, polygons, and image overlays (kmz only)."
                      style="color:#395057;background-color:#f2f2f2;border:1px solid #ced4da;border-radius:0.2rem;padding:0.15rem 0.5rem;"><span>Upload kml/kmz</span></button>
              <button id="kmlSelectBtn" class="btn cxm-small-no-btn"
                      title="Show/Hide uploaded kml/kmz files"
                      style="display:none;" data-toggle="modal" data-target="#modalkmlselect">
                      <span id="eye_kml"  class="glyphicon glyphicon-eye-open"></span></button>
</div>
            </div> <!-- end of kml -->

<!-- seismicity -->
            <div class="col-3" style="border:solid 0px blue; display:none">
              <div id="loadSeismicity" class="row" style="width:20rem;">
          <button id="quakesBtn" class="btn" 
                        onClick="loadSeismicity()" title="This loads the updated Hauksson et al. (2012) and Ross et al. (2019) relocated earthquake catalogs and provides a pull-down menu with options to color by depth, magnitude, or time. Significant historical events (1900-2021 >M6.0) are shown with red dots. These can be turned on/off by clicking on the button on the right which appears here once the catalogs have been loaded" style="color:#395057;background-color:#f2f2f2;border:1px solid #ced4da;border-radius:0.2rem;padding:0.15rem 0.5rem;display:;">Load relocated seismicity</button>
              </div>
 
              <div id="showSeismicity" class="row" style="width:20rem; display:none;">
                <select id="seismicitySelect" onchange="changePixiOverlay(this.value)"
                class="custom-select custom-select-sm" style="width:auto;min-width:14rem;">
             <option value="none">Hide relocated seismicity</option>
                   <option selected value="haukssondepth">Hauksson et al. by depth</option>
                   <option value="haukssonmag">Hauksson et al. by magnitude</option>
                   <option value="haukssontime">Hauksson et al. by time</option>
                   <option value="rossdepth">Ross et al. by depth</option>
                   <option value="rossmag">Ross et al. by magnitude</option>
                   <option value="rosstime">Ross et al. by time</option>
                <!--
                   <option value="historicaldepth">Historical by depth</option>
                   <option value="historicalmag">Historical by magitude</option>
                   <option value="historicaltime">Historical by time</option>
                -->
                </select>
                <button id="toggleHistoricalBtn" class="btn btn-sm cxm-small-btn" title="Show/Hide significant historic earthquakes (M6+) since 1900" onclick="toggleHistorical()"><span id="eye_historical" class="glyphicon glyphicon-eye-open"></span></button>
               </div>
            </div> <!-- end of seismicity -->

<!-- basemap -->
            <div class="input-group input-group-sm custom-control-inline" id="map-controls" style="margin-right:15px">
              <div class="input-group-prepend">
                <label style='border-bottom:1;' class="input-group-text" for="mapLayer">Select Map Type</label>
              </div>
              <select id="mapLayer" class="custom-select custom-select-sm"
                                               onchange="switchLayer(this.value);">
                  <option selected value="esri topo">ESRI Topographic</option>
                  <option value="esri NG">ESRI National Geographic</option>
                  <option value="esri imagery">ESRI Imagery</option>
                  <option value="otm topo">OTM Topographic</option>
                  <option value="osm street">OSM Street</option>
                  <option value="shaded relief">Shaded Relief</option>
              </select>
            </div> <!-- end of basemap -->

          </div> <!-- row -->
        </div> <!-- top-control-row2 -->

      </div> <!-- csm-controls-container -->
    </div> <!-- top-control -->

<!-- map space -->
    <div id="mapDataBig" class="row mapData">

       <div id="metricData" class="col-5 button-container d-flex flex-column pr-0" style="overflow:hidden;border:solid 2px red">

<!-- search method -->
         <div class="row">
           <div class="input-group filters mt-1 mb-1" style="margin-left:15px; border:1px solid blue">
             <select id="csm-search-type" class="custom-select custom-select-sm">
               <option value="none">Search by </option>
               <option value="model">Model</option>
               <option value="latlon">Latitude &amp; Longitude</option>
             </select>
             <div class="input-group-append">
               <button id="toReset" type="button" class="btn btn-dark" >Reset</button>
             </div>
           </div>

           <div id="csm-search-btn" class="row" style="margin-left:30px;;display:none;">
             <button id="toSearch" class="btn" style="color:#395057;background-color:#f2f2f2;border:1px solid #ced4da;border-radius:0.2rem;"><span>SEARCH</span></button>
           </div>
         </div>

<!-- search-option -->
         <div id="search-option" style="border:solid 0px green" >
            <ul id="option" class="navigation" style="padding: 0 0 0 0;">
              <li id='csm-model' class='navigationLi' style="display:none;border:solid 1px red">
              </li>
              <li id='csm-latlon' class='navigationLi mt-1' style="display:none; border:solid 1px red">
                <div id='latlonMenu' class='menu'>
                  <div class="row">
                    <div class="col-5">
                          <p>Draw a rectangle on the map or enter latitudes and longitudes.</p>
                    </div>
                  <div class="col-2 pl-0 pr-0">
                      <input type="text"
                          placeholder="Latitude"
                          id="firstLatTxt"
                          title="first lat"
                          onfocus="this.value=''"
                          class="latlon-item form-control">
                      <input type="text" 
                          id="firstLonTxt" 
                          placeholder='Longitude' 
                          title="first lon"
                          onfocus="this.value=''" 
                          class="latlon-item form-control mt-1">
                    </div>
                    <div class="col-2 pl-1 pr-0">
                      <input type="text"
                          id="secondLatTxt"
                          title="optional second lat"
                          value='optional'
                          onfocus="this.value=''"
                          class="latlon-item form-control">
                      <input type="text"
                          id="secondLonTxt"
                          title="optional second lon"
                          value='optional'
                          onfocus="this.value=''"
                          class="latlon-item form-control mt-1">
                    </div>
                  </div>
                </div>
              </li>
            </ul> <!-- option -->
         </div>

<!-- model select -->
         <div class="input-group input-group-sm custom-control-inline">
            <div class="input-group-prepend">
                  <label class="input-group-text" for="modelType">Select CSM Model</label>
            </div>
            <select id="modelType" class="custom-select custom-select-sm"></select>
         </div> <!-- model select -->


<!-- model depth list -->
         <div id="modelDepth" class="mt-2" style="border:solid 1px green">
           <div id="modelDepth-options" class="form-check"> </div>
         </div>
<!-- metric list -->
         <div id="modelMetric" class="mt-2" style="border:solid 1px blue">
           <div id="modelMetric-options" class="form-check"> </div>
         </div>

<!-- result parking location -->
         <div id="parkingLot" style="display:none">
<!--  metric range for model/depth/metric combo  -->
            <input type="text" id="parkingMaxMetricVal" value='' onchange="reset_maxMetric()">
            <input type="text" id="parkingMinMetricVal" value='' onchange="reset_minMetric()">
            <div id="phpResponseTxt"></div>
         </div>

       </div> <!-- metricData -->

<!-- leaflet 2D map -->
       <div id="top-map" class="col-7 pl-1">
          <div class="w-100 mb-1" id='CSM_plot'
             style="position:relative;border:solid 1px #ced4da; height:576px;">

             <div class="spinDialog" style="position:absolute;top:40%;left:50%; z-index:9999;">
               <div id="csm-wait-spin" align="center" style="display:none;"><i class="glyphicon glyphicon-cog fa-spin" style="color:red"></i></div>
             </div>

          </div>
       </div>

    </div> <!-- mapDataBig -->

    <div id="top-select" class="row mb-2">
      <div class="col-12">
         <div id="metadata-table-container" style="border:solid 1px #ced4da;overflow-x:hidden">
            <table id="metadata-table">
              <thead>
              </thead>
              <tbody>
                <tr id="placeholder-row">
                  <td colspan="9">Metadata for selected model will appear here. </td>
                </tr>
            </table>
         </div>
      </div>
    </div> <!-- top-select -->

</div> <!-- main -->

<div id="plot-range-key-container" style="display:none;">
    <div id="plot-range-key" class="row" style="opacity:0.8">
        <div class="col" style="width:110px;height:24px;">
           <span class="min" style="width:1rem"></span>
           <span class="ui-slider-range" style="border:1px solid grey; width:60px;height:15px;"></span>
           <span class="max"></span>
        </div>
    </div>
    <div id="plot-range-label" class="row" style="display:;opacity:0.8">
        <label><span id="plot-range-label-string"></span></label>
    </div>
</div>

<div id="expand-view-key-container" style="display:none;">
  <div id="expand-view-key" class="row" style="opacity:0.8; height:1.4rem;">
    <button id="bigMapBtn" class="btn cxm-small-btn" title="Expand into a larger map" style="color:black;background-color:rgb(255,255,255);padding: 0rem 0.3rem 0rem 0.3rem" onclick="toggleBigMap()"><span class="fas fa-expand"></span>
    </button>
  </div>
</div>

<!-- modal list -->
<!--Modal: Model (modalkmlselect) -->
<div class="modal" id="modalkmlselect" tabindex="-1" style="z-index:9999" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-small" id="modalkmlselectDialog" role="document">

    <!--Content-->
    <div class="modal-content" id="modalkmlselectContent">
      <!--Body-->
      <div class="modal-body" id="modalkmlselectBody">
        <div class="row col-md-12 ml-auto" style="overflow:hidden;">
          <div class="col-12" id="kmlselectTable-container" style="font-size:14pt"></div>
        </div>
      </div>
      <div class="modal-footer justify-content-center">
        <button type="button" class="btn btn-outline-primary btn-md" data-dismiss="modal">Close</button>
      </div>

    </div> <!--Content-->
  </div>
</div> <!--Modal: modalkmlselect-->

<!--call php directly-->
    <script type="text/javascript">
            csm_meta_data = <?php print $csm->getAllMetaData()->outputJSON(); ?>;
    </script>

</body>
</html>

