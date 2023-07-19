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
    <script type='text/javascript' src='js/vendor/jquery.csv.js'></script>

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
    <script type="text/javascript" src="js/csm_ui.js?v=1"></script>
    <script type="text/javascript" src="js/csm_model.js?v=1"></script>
    <script type="text/javascript" src="js/csm_main.js?v=1"></script>
    <script type="text/javascript" src="js/csm.js?v=1"></script>
    <script type="text/javascript" src="js/csm_leaflet.js?v=1"></script>

<!-- pixi pixiOverlay -->
    <script type="text/javascript" src="js/vendor/pixi.js"></script>
    <script type="text/javascript" src="js/vendor/pixiOverlay/L.PixiOverlay.js"></script>
<!--
    <script type="text/javascript" src="js/vendor/pixiOverlay/example.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/leaflet-pixi-overlay@1.9.4/L.PixiOverlay.min.js "></script>
    <script type="text/javascript" src="js/vendor/pixiOverlay/MarkerContainer.js"></script>
    <script type="text/javascript" src="js/vendor/pixiOverlay/bezier-easing.js"></script>
-->
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
                       title="Show Luttrell & Hardebeck (2021) borehole SHmax orientations on map"
                       for="cxm-model-csm-boreholes">
                <input class='form-check-inline mr-1'
                       type="checkbox"
                       id="cxm-model-csm-boreholes" value="1" />Borehole SHmax
                </label>
                <!-- boreholes download button -->
                <button id="boreholeDownloadBtn" class="btn cxm-small-btn"
                        onClick="downloadBorehole()">
		       <span class="glyphicon glyphicon-download" 
                            title="Download Luttrell & Hardebeck (2021) borehole data file"
                            style="font-size:14px"></span></button>
              </div>
              <div class="form-check form-check-inline">
                <label class='form-check-label ml-1 mini-option'
                       title="Show Community Fault Model v6.0 traces on map"
                       for="cxm-model-cfm">
                <input class='form-check-inline mr-1'
                       type="checkbox"
                       id="cxm-model-cfm" value="1" />CFM6.0
                </label>
              </div>
              <div class="form-check form-check-inline">
                <label class='form-check-label ml-1 mini-option'
                      title="Show the Geologic Framework Model regions on map"
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

<!-- basemap -->
            <div class="input-group input-group-sm custom-control-inline" id="map-controls" style="margin-right:15px">
              <div class="input-group-prepend">
                <label style='border-bottom:1;' class="input-group-text" for="mapLayer">Select Map Type</label>
              </div>
              <select id="mapLayer" class="custom-select custom-select-sm"
                                               onchange="switchLayer(this.value);">
                  <option selected value="esri topo">ESRI Topographic</option>
                  <option value="esri imagery">ESRI Imagery</option>
                  <option value="Jawg Light">Jawg Light</option>
                  <option value="Jawg Dark">Jawg Dark</option>
                  <option value="esri NG">ESRI National Geographic</option>
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

       <div id="metricData" class="col-5 button-container flex-column pr-0" style="overflow:hidden;border:solid 0px red;">
<!-- search method -->
         <div class="row" style="border:solid 0px blue">
             <div class="col-9">
               <form id="csm-search-type">
                 <label><input type="radio" id="searchTypeModel" name="searchtype" onclick="CSM.showSearch('model')"><span>Explore Models</span></label>
                 <label><input type="radio" id="searchTypeData" name="searchtype" onclick="CSM.showSearch('latlon')"><span>Select Region</span></label>
               </form>
             </div>

             <div id="csm-reset-btn" class="col-2">
               <div class="row justify-content-end">
               <button id="toReset" type="button" class="btn btn-dark" >Reset</button>
               </div>
             </div>
         </div>

<!-- model select -->
         <div class="input-group input-group-sm custom-control-inline mt-2" style="max-width:450px">
            <div class="input-group-prepend">
                  <label class="input-group-text" for="modelType">Select CSM Model</label>
            </div>
            <select id="modelType" class="custom-select custom-select-sm"></select>
         </div> <!-- model select -->

         <div class="input-group input-group-sm custom-control-inline mt-2" style="max-width:450px">
            <div class="input-group-prepend">
                  <label class="input-group-text" for="modelMetric">Select Model Metric</label>
            </div>
	    <select id="modelMetric" class="custom-select custom-select-sm"></select>
	 </div> 

         <div class="input-group input-group-sm custom-control-inline mt-2" style="max-width:450px">
            <div class="input-group-prepend">
                  <label class="input-group-text" for="modelDepth">Select Model Depth</label>
            </div>
	    <select id="modelDepth" class="custom-select custom-select-sm">
                 <option id="csmdepth_1" value=1>1 km</option>
                  <option id="csmdepth_3" value=3>3 km</option>
                  <option id="csmdepth_5" value=5>5 km</option>
                  <option id="csmdepth_7" value=7>7 km</option>
                  <option id="csmdepth_9" value=9>9 km</option>
                  <option id="csmdepth_11" value=11>11 km</option>
                  <option id="csmdepth_13" value=13>13 km</option>
                  <option id="csmdepth_15" value=15>15 km</option>
                  <option id="csmdepth_17" value=17>17 km</option>
                  <option id="csmdepth_19" value=19>19 km</option>
                  <option id="csmdepth_21" value=21>21 km</option>
                  <option id="csmdepth_23" value=23>23 km</option>
                  <option id="csmdepth_25" value=25>25 km</option>
                  <option id="csmdepth_50" value=50>50 km</option>
                  <option id="csmdepth_75" value=75>75 km</option>
                  <option id="csmdepth_100" value=100>100 km</option>
            </select>
	 </div> 
         
<!-- opacity slider -->
         <div class="input-group input-group-sm custom-control-inline mt-2" style="max-width:450px">
            <div class="input-group-prepend">
                  <label class="input-group-text">Change Opacity</label>
            </div>
            <div class="row" style="min-width:300px;margin:5px 0px 0px 20px; border:solid 0px green;">
                0%
	          <div class="col-8" id="opacitySlider" style="margin:5px 15px 5px 15px;border:1px solid rgb(206,212,218)">
                     <div id="opacitySlider-handle" class="ui-slider-handle"></div>
                  </div>
                100%
            </div>
         </div>

<!-- search-option -->
         <div id="search-option" class="col-12 mt-4"style="border:solid 0px green" >
            <ul id="option" class="navigation col-11" style="padding: 0 0 0 0;margin-bottom: 0">

              <li id='csm-model' class='row navigationLi' style="display:none;border:solid 0px red;">
<!--  segment debug toggle set -->
                  <div class="row">
                    <div class="col-10" id="pixi-segment-debug" style="display:none;">
                      <div id="pixi-segment"></div>
                    </div>
                  </div>

              </li>

              <li id='csm-latlon' class='navigationLi' style="display:none; border:solid 0px red">
                <div id='latlonMenu' class='menu'>
                  <div class="row">
                    <div class="col-6">
		      <p>Draw a rectangle on the map or enter latitudes and longitudes.
		      <button id="searchAgain" class="btn cxm-small-btn dropdown-toggle" onclick="CSM.searchLatlon(0,[])"></button>
<!--
		      <button id="searchAgain" class="btn cxm-small-btn dropdown-toggle" onclick="CSM.searchLatlon(0,[])"><span class="glyphicon glyphicon-record" style="font-size:6px"></span></button>
-->
                      </p>
                    </div>
                    <div class="col-3 pl-0 pr-2">
                      <input type="text"
                          placeholder="Latitude"
                          id="csm-firstLatTxt"
                          title="first lat"
                          onfocus="this.value=''"
                          class="csm-latlon-item form-control">
                      <input type="text" 
                          id="csm-firstLonTxt" 
                          placeholder='Longitude' 
                          title="first lon"
                          onfocus="this.value=''" 
                          class="csm-latlon-item form-control mt-1">
                    </div>
                    <div class="col-3 pl-2 pr-0">
                      <input type="text"
                          id="csm-secondLatTxt"
                          title="optional second lat"
                          value='optional'
                          onfocus="this.value=''"
                          class="csm-latlon-item form-control">
                      <input type="text"
                          id="csm-secondLonTxt"
                          title="optional second lon"
                          value='optional'
                          onfocus="this.value=''"
                          class="csm-latlon-item form-control mt-1">
                    </div>
                  </div>
                </div>
              </li>
            </ul> <!-- option -->
         </div>

<!-- description page -->
         <div id="csm-description" class="col-12 pr-0" style="font-size:14px; background-color:rgb(245,245,245); max-width:450px" >
           <br>
           <p><b>You Selected:</b></p>
           <p id="csm-model-description"></p>
           <p id="csm-metric-description"></p>
           <p>For more model details and metrics, see [LINK TO ZENODO ARCHIVE]</p>
         </div>

<!-- result parking location -->
         <div id="parkingLot" style="display:none">
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

<!-- legend --> 
  <div class="main-legend geometry top center" style="bottom:10%;background-color: rgba(255,255,255,0.5);">
<div class="col">
    <div class="row" style="margin:0px 2px 0px -20px">
        <div class="legend mt-2" id="pixi-legend-color"></div> 
        <div class="legend" id="pixi-legend-label"></div> 
    </div>
    <div id="pixi-legend-title" align="center" class="legend content mt-1" style="border-top:2px solid grey">Degrees</div>
</div>
  </div>
<!-- legend -->

          </div>
       </div>

    </div> <!-- mapDataBig -->

    <div id="top-select" class="row mb-2">
      <div class="col-12">
         <div id="metadata-table-container" style="border:solid 1px #ced4da;overflow-x:hidden">
            <table id="metadata-table">
              <thead>
              </thead>
            </table>
         </div>
      </div>
    </div> <!-- top-select -->

</div> <!-- main -->

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

