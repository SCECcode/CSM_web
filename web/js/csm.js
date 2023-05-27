/***
   csm.js

   needs to track the 'depths' per models ??
   also need to track different models
***/

var CSM = new function () {
    window.console.log("in CSM..");

    // complete set of csm layers, one marker layer for one site, 
    // setup once from viewer.php
    this.csm_layers;
    this.csm_markerLocations = [];

    // searched layers being actively looked at -- result of a search
    this.csm_active_layers= new L.FeatureGroup();
    this.csm_markerLocations = [];
    this.csm_active_gid = [];

    // selected some layers from active layers
    // to be displayed at the metadata_table
    this.csm_selected_gid = [];

    // locally used, floats
    var csm_depth_min=undefined;
    var csm_depth_max=undefined;

    var site_colors = {
        normal: '#006E90',
        selected: '#B02E0C',
        abnormal: '#00FFFF',
    };

    var site_marker_style = {
        normal: {
            color: site_colors.normal,
            fillColor: site_colors.normal,
            fillOpacity: 0.5,
            radius: 3,
            riseOnHover: true,
            weight: 1,
        },
        selected: {
            color: site_colors.selected,
            fillColor: site_colors.selected,
            fillOpacity: 1,
            radius: 3,
            riseOnHover: true,
            weight: 1,
        },
        hover: {
            fillOpacity: 1,
            radius: 10,
            weight: 2,
        },
    };

// coordinates: [34.28899, -118.399],
    this.defaultMapView = {
        coordinates: [37.73, -119.9],
        zoom: 8 
    };

    this.searchType = {
        none: 'none',
        latlon: 'latlon'
    };

    this.searchingType=this.searchType.none;
    var tablePlaceholderRow = `<tr id="placeholder-row">
                        <td colspan="9">Metadata for selected region will appear here.</td>
                    </tr>`;

//???
    this.activateData = function() {
        this.showOnMap();
        $("div.control-container").hide();
        $("#csm-controls-container").show();

    };

/********** show layer/select functions *********************/

// csm_meta_data is from viewer.php, which is the JSON 
// result from calling php getAllMetaData script
    this.processMeta = function () {
window.console.log("HERE... processMeta");
        for (const index in csm_meta_data) {
          if (csm_meta_data.hasOwnProperty(index)) {
                let gid = csm_meta_data[index].gid;
                var marker;

                marker.scec_properties = {
                    idx: index,
                    active: true,
                    selected: false,
                    gid: gid,
                };

            }
        }
    };

// recreate a new active_layers using a glist
// glist is a sorted ascending list
// this.csm_layers should be also ascending
    this.createActiveLayerGroupWithGids = function(glist) {

        // remove the old ones and remove from result table
        this.clearAllSelections()
        this.csm_active_layers.remove();
        this.csm_active_layers= new L.FeatureGroup();
        this.csm_active_gid=[];
        this.csm_active_markerLocations = [];

        let gsz=glist.length;
        let lsz= this.csm_layers.length;
        let i_start=0;

        for (let j=0; j<gsz; j++) {
          let gid=glist[j];
          for (let i=i_start; i< lsz; i++) {
            let layer = this.csm_layers[i];
            if (layer.hasOwnProperty("scec_properties")) {
               if (gid == layer.scec_properties.gid) {
                  this.replaceColor(layer);
                  this.csm_active_layers.addLayer(layer);
                  this.csm_active_gid.push(gid);
                  this.csm_active_markerLocations.push(layer.getLatLng())                      
                  i_start=i+1;
                  break;
               }
            }
          }
        }
        replaceResultTableBodyWithGids(glist);
        this.csm_active_layers.addTo(viewermap);

        if(this.csm_active_markerLocations.length > 0) {
          let bounds = L.latLngBounds(this.csm_active_markerLocations);
window.console.log("flyingBounds --new list");
          viewermap.flyToBounds(bounds);
        }
    };

// recreate the original map state
// original state  toOriginal use normal color
    this.recreateActiveLayerGroup = function(toOriginal) {

        if(this.csm_active_gid.length != this.csm_layers.length 
               || this.searchingType == this.searchType.minrate
               || this.searchingType == this.searchType.maxrate) {
          this.csm_active_layers= new L.FeatureGroup();
          this.csm_active_gid=[];
        
          for (let i=0; i< this.csm_layers.length; i++) {
            let marker = this.csm_layers[i];
            if (marker.hasOwnProperty("scec_properties")) {
               let gid = marker.scec_properties.gid;
               if(!toOriginal) {
                 this.replaceColor(marker);
               }
               this.csm_active_layers.addLayer(marker);
               this.csm_active_gid.push(gid);
               this.csm_active_markerLocations.push(marker.getLatLng())                      
            }
          }
          replaceResultTableBodyWithGids(this.csm_active_gid);
          this.csm_active_layers.addTo(viewermap);
          } else {
            this.csm_active_layers.addTo(viewermap);
       }
window.console.log("flyingBounds --recreateActiveLayer");
       let bounds = L.latLngBounds(this.csm_active_markerLocations);
       viewermap.flyToBounds(bounds);
    }

// search for a layer from master list by gid
    this.getLayerByGid = function(gid) {
        let foundLayer = false;
        for (let i=0; i< this.csm_layers.length; i++) {
          let layer = this.csm_layers[i];
          if (layer.hasOwnProperty("scec_properties")) {
             if (gid == layer.scec_properties.gid) {
                 return layer;     
             }
          }
       }
       return foundLayer;
    };

// select from currently active sites
    this.toggleSiteSelected = function(layer, clickFromMap=false) {

if(clickFromMap) {
window.console.log("toggleSiteSlected from map");             
} else {
window.console.log("toggleSiteSlected from tables");             
}
        if (typeof layer.scec_properties.selected === 'undefined') {
            layer.scec_properties.selected = true;
        } else {
            layer.scec_properties.selected = !layer.scec_properties.selected;
        }
        if (layer.scec_properties.selected) {
            this.selectSiteByLayer(layer, clickFromMap);
                
            if(!clickFromMap) {  // click from Table, lets fly over
              let markerLocations = [];
              markerLocations.push(layer.getLatLng())                      
              let bounds = L.latLngBounds(markerLocations);
window.console.log("flyingBounds --click site");
              viewermap.flyToBounds(bounds);
            }

        } else {
            this.unselectSiteByLayer(layer);
        }
        return layer.scec_properties.selected;
    };

    this.toggleSiteSelectedByGid = function(gid) {
        let layer = this.getLayerByGid(gid);
        return this.toggleSiteSelected(layer, false);
    };

    this.selectSiteByLayer = function (layer, moveTableRow=false) {
        layer.scec_properties.selected = true;
        layer.setStyle(site_marker_style.selected);
        let gid = layer.scec_properties.gid;

        this.upSelectedCount(gid);

        // metatable table
        let $row = $(`tr[sliprate-metadata-gid='${gid}'`);
        let rowHTML = "";
        if ($row.length == 0) {
           this.addToMetadataTable(layer);
        }
        // move row to top
        if (moveTableRow) {
window.console.log("XX HERE moving table Row ???");
            let $rowHTML = $row.prop('outerHTML');
            $row.remove();
            $("#metadata-table.sliprate tbody").prepend($rowHTML);
        }

        // search result table 
        let label="sliprate-result-gid_"+gid;
        let $elt=$(`#${label}`);
        if ($elt) {
            $elt.addClass('glyphicon-check').removeClass('glyphicon-unchecked');
        }
    };

    this.unselectSiteByLayer = function (layer) {
        layer.scec_properties.selected = false;
        layer.setStyle(site_marker_style.normal);

        let gid = layer.scec_properties.gid;

        this.downSelectedCount(gid);

        let $row = $(`tr[sliprate-metadata-gid='${gid}'`);
        if ($row.length != 0) {
           this.removeFromMetadataTable(gid);
        }

        let label="sliprate-result-gid_"+gid;
        let $elt=$(`#${label}`);
        if ($elt) {
            $elt.addClass('glyphicon-unchecked').removeClass('glyphicon-check');
        }
    };

    this.unselectSiteByGid = function (gid) {
        let layer = this.getLayerByGid(gid);
        return this.unselectSiteByLayer(layer);
    };

// selectAll button - toggle
    this.toggleSelectAll = function() {
        var sliprate_object = this;

        let $selectAllButton = $("#csm-allBtn span");
        if (!$selectAllButton.hasClass('glyphicon-check')) {
            this.csm_active_layers.eachLayer(function(layer){
                sliprate_object.selectSiteByLayer(layer);
            });
            $selectAllButton.addClass('glyphicon-check').removeClass('glyphicon-unchecked');
        } else {
            this.clearSelectAll();
        }
    };

// selectAll button  - clear
    this.clearSelectAll = function() {
        this.clearAllSelections();
        let $selectAllButton = $("#csm-allBtn span");
        $selectAllButton.removeClass('glyphicon-check').addClass('glyphicon-unchecked');
    };

// unselect every active layer
    this.clearAllSelections = function() {
        var sliprate_object = this;
        this.csm_active_layers.eachLayer(function(layer){
            sliprate_object.unselectSiteByLayer(layer);
        });
        let $selectAllButton = $("#csm-allBtn span");
        $selectAllButton.removeClass('glyphicon-check').addClass('glyphicon-unchecked');
    };

    this.upSelectedCount = function(gid) {
       let i=this.csm_selected_gid.indexOf(gid); 
       if(i != -1) {
         window.console.log("this is bad.. already in selected list "+gid);
         return;
       }
       window.console.log("=====adding to list "+gid);
       this.csm_selected_gid.push(gid);
       updateDownloadCounter(this.csm_selected_gid.length);
    };

    this.downSelectedCount = function(gid) {
       if(this.csm_selected_gid.length == 0) { // just ignore..
         return;
       }
       let i=this.csm_selected_gid.indexOf(gid); 
       if(i == -1) {
         window.console.log("this is bad.. not in selected list "+gid);
         return;
       }
       window.console.log("=====remove from list "+gid);
       this.csm_selected_gid.splice(i,1);
       updateDownloadCounter(this.csm_selected_gid.length);
    };

    this.zeroSelectedCount = function() {
       this.csm_selected_gid = [];
       updateDownloadCounter(0);
    };


/********** search/layer  functions *********************/
    this.showSearch = function (type) {
        const $all_search_controls = $("#csm-sliprate-search-control ul li");
        $all_search_controls.hide();
        switch (type) {
            case this.searchType.faultname:
                $("#csm-fault-name").show();
                break;
            case this.searchType.sitename:
                $("#csm-site-name").show();
                break;
            case this.searchType.latlon:
                $("#csm-latlon").show();
                drawRectangle();
                break;
            case this.searchType.minrate:
                $("#csm-minrate-slider").show();
                showKey(csm_minrate_min, csm_minrate_max);
                break;
            case this.searchType.maxrate:
                $("#csm-maxrate-slider").show();
                showKey(csm_maxrate_min, csm_maxrate_max);
                break;
            default:
                // no action
        }
    };

    this.showOnMap = function () {
        this.csm_active_layers.addTo(viewermap);
    };

    this.hideOnMap = function () {
        this.csm_active_layers.remove();
    };

// reset from the reset button
// reset option button, the map to original state
// but leave the external model state the same
    this.reset = function () {

window.console.log("calling reset");
        this.resetSearch();

        if ($("#csm-model-cfm").prop('checked')) {
          CXM.showCFMFaults(viewermap);
          } else {
          CXM.hideCFMFaults(viewermap);
        }

        if ($("#csm-model-gfm").prop('checked')) {
          CXM.showGFMRegions(viewermap);
          } else {
          CXM.hideGFMRegions(viewermap);
        }

        $("#csm-search-type").val("");
        this.searchingType = this.searchType.none;

        // go back to default view,
window.console.log("call setView.. default");
        viewermap.setView(this.defaultMapView.coordinates, this.defaultMapView.zoom);
    };

// reset just the search only
    this.resetSearch = function (){

window.console.log("sliprate calling --->> resetSearch.");

        this.clearAllSelections();

        this.resetMinrate();
        this.resetMaxrate();
        this.resetLatLon();
        this.resetFaultname();
        this.resetSitename();

        this.hideOnMap();
        this.recreateActiveLayerGroup(true);

    };

// a complete fresh search
    this.freshSearch = function (t){

        this.resetSearch();

        const $all_search_controls = $("#csm-controls-container ul li")
window.console.log("sliprate --- calling freshSearch..");
        switch (t) {
            case "faultname": 
               this.searchingType = this.searchType.faultname;
               $all_search_controls.hide();
               $("#csm-fault-name").show();
               break;
            case "sitename": 
               this.searchingType = this.searchType.sitename;
               $all_search_controls.hide();
               $("#csm-site-name").show();
               break;
            case "minrate": 
               this.searchingType = this.searchType.minrate;
               $all_search_controls.hide();
               $("#csm-minrate-slider").show();
               showKey(csm_minrate_min, csm_minrate_max);
               this.recreateActiveLayerGroup(false);
               break;
            case "maxrate": 
               this.searchingType = this.searchType.maxrate;
               $all_search_controls.hide();
               $("#csm-maxrate-slider").show();
               showKey(csm_maxrate_min, csm_maxrate_max);
               this.recreateActiveLayerGroup(false);
               break;
            case "latlon": 
               this.searchingType = this.searchType.latlon;
               $all_search_controls.hide();
               $("#csm-latlon").show();
               drawRectangle();
               break;
            default:
               this.searchingType = this.searchType.none;
               break;
        }

        if ($("#csm-model-cfm").prop('checked')) {
          CXM.showCFMFaults(viewermap);
          } else {
          CXM.hideCFMFaults(viewermap);
        }

        if ($("#csm-model-gfm").prop('checked')) {
          CXM.showGFMRegions(viewermap);
          } else {
          CXM.hideGFMRegions(viewermap);
        }
    };

    this.getMarkerBySiteId = function (site_id) {
        for (const index in csm_meta_data) {
            if (csm_meta_data[index].csm_id == site_id) {
                return csm_meta_data[index];
            }
        }

        return [];
    };

    this.search = function(type, criteria) {

        if(type != this.searchingType)
          return;

        $searchResult = $("#searchResult");
        if (!type || !criteria) {
            $searchResult.html("");
        }
        if (!Array.isArray(criteria)) {
            criteria = [criteria];
        }

        let JSON_criteria = JSON.stringify(criteria);

// not used:        $("#wait-spinner").show();

        $.ajax({
            url: "php/search.php",
            data: {t: type, q: JSON_criteria},
        }).done(function(sliprate_result) {
            let glist=[];
            if(sliprate_result === "[]") {
window.console.log("Did not find any PHP result");
            } else {
                let tmp=JSON.parse(sliprate_result); 
                if(type == CSM.searchType.latlon) {
//expected [{'gid':'2'},{'gid':'10'}]
                    let sz=tmp.length;
                    for(let i=0; i<sz; i++) {
                        let gid= parseInt(tmp[i]['gid']); 
                        glist.push(gid);
                    }
                    } else {
window.console.log( "BAD, unknown search type \n");
                }
            }
            CSM.createActiveLayerGroupWithGids(glist);
        });
    };

    // special case, Latlon can be from text inputs or from the map
    // fromWhere=0 is from text
    // fromWhere=1 from drawRectangle call
    this.searchLatlon = function (fromWhere, rect) {
        let criteria = [];
        if( fromWhere == 0) {
            let lat1=$("#csm-firstLatTxt").val();
            let lon1=$("#csm-firstLonTxt").val();
            let lat2=$("#csm-secondLatTxt").val();
            let lon2=$("#csm-secondLonTxt").val();
            if(lat1=='' || lon1=='' || lat2=='' || lon2=='') return;
            remove_bounding_rectangle_layer();
            add_bounding_rectangle(lat1,lon1,lat2,lon2);
            criteria.push(lat1);
            criteria.push(lon1);
            criteria.push(lat2);
            criteria.push(lon2);
            } else {
                var loclist=rect[0];
                var sw=loclist[0];
                var ne=loclist[2];
                criteria.push(sw['lat']);
                criteria.push(sw['lng']);
                criteria.push(ne['lat']);
                criteria.push(ne['lng']);

                $("#csm-firstLatTxt").val(criteria[0]);
                $("#csm-firstLonTxt").val(criteria[1]);
                $("#csm-secondLatTxt").val(criteria[2]);
                $("#csm-secondLonTxt").val(criteria[3]);
        }
                 
        this.search(CSM.searchType.latlon, criteria);

        let markerLocations = [];
        markerLocations.push(L.latLng(criteria[0],criteria[1]));
        markerLocations.push(L.latLng(criteria[2],criteria[3]));
        let bounds = L.latLngBounds(markerLocations);
window.console.log("flyingBounds --latlon");
        viewermap.flyToBounds(bounds);
//        setTimeout(skipRectangle, 500);
    };

/********** metadata  functions *********************/
// create a metadata list using selected gid list
/*
gid
sliprate_id
longitude
latitude
fault_name
fault_id
state
site_name
data_type
dist_to_cfmfault
cfm6_objectname
observation
pref_rate
low_rate
high_rate
rate_unct
rate_type
rept_reint
offset_type
age_type
num_events
rate_age
q_bin_min
q_bin_max
reference
**
FaultName,FaultID,State,SiteName,CPDId,SliprateId,Longitude,Latitude,DistToCFMFault,CFM6ObjectName,DataType,Observation,PrefRate,LowRate,HighRate,RateUnct,RateType,ReptReint,OffsetType,AgeType,NumEvents,RateAge,QbinMin,QbinMax,Reference
gid
faultname
faultid
state
sitename
csmid
sliprateid
longitude
latitud
disttocfmfault
cfm6objectname
datatype
observation
prefrate
lowrate
highrate
rateunct
ratetype
reptreint
offsettype
agetype
numevents
rateage
qbinmin
qbinmax
reference
*/
    function createMetaData(properties) {
        var meta={};
        meta.fault_name = properties.faultname;
        meta.fault_id = properties.faultid;
        meta.state = properties.state;
        meta.site_name = properties.sitename;
        meta.csm_id= properties.csmid;
        meta.sliprate_id= properties.sliprateid;
        meta.longitude = properties.longitude;
        meta.latitude = properties.latitude;
        meta.dist_to_cfmfault = properties.disttocfmfault;
        meta.cfm6_objectname = properties.cfm6objectname;
        meta.data_type = properties.datatype;
        meta.observation = properties.observation;
        meta.pref_rate = properties.prefrate;
        meta.low_rate = properties.lowrate;
        meta.high_rate = properties.highrate;
        meta.rate_unct = properties.rateunct;
        meta.rate_type = properties.ratetype;
        meta.rept_reint = properties.reptreint;
        meta.offset_type = properties.offsettype;
        meta.age_type = properties.agetype;
        meta.num_events = properties.numevents;
        meta.rate_age = properties.rateage;
        meta.q_bin_min = properties.qbinmin;
        meta.q_bin_max = properties.qbinmax;
        meta.reference = properties.reference;

        return meta;
    }

    this.addToMetadataTable = function(layer) {
        let $table = $("#metadata-table.sliprate tbody");
        let gid = layer.scec_properties.gid;
        if ($(`tr[sliprate-metadata-gid='${gid}'`).length > 0) {
            return;
        }
        let html = generateMetadataTableRow(layer);
        $table.prepend(html);
    };

    this.removeFromMetadataTable = function (gid) {
        $(`#metadata-table tbody tr[sliprate-metadata-gid='${gid}']`).remove();
    };

    var generateMetadataTableRow = function(layer) {
        let $table = $("#metadata-table");
        let html = "";

        html += `<tr sliprate-metadata-gid="${layer.scec_properties.gid}">`;

        html += `<td><button class=\"btn btn-sm cxm-small-btn\" id=\"button_meta_${layer.scec_properties.gid}\" title=\"remove the site\" onclick=CSM.unselectSiteByGid("${layer.scec_properties.gid}");><span id=\"sliprate_metadata_${layer.scec_properties.gid}\" class=\"glyphicon glyphicon-trash\"></span></button></td>`;
        html += `<td class="meta-data">${layer.scec_properties.csm_id}</td>`;
        html += `<td class="meta-data">${layer.scec_properties.fault_name} </td>`;
        html += `<td class="meta-data">${layer.scec_properties.site_name}</td>`;
        html += `<td class="meta-data">${layer.scec_properties.latitude} </td>`;
        html += `<td class="meta-data">${layer.scec_properties.longitude} </td>`;

        html += `<td class="meta-data" align='center' >${layer.scec_properties.low_rate} </td>`;
        html += `<td class="meta-data" align='center' >${layer.scec_properties.high_rate}</td>`;

        html += `<td class="meta-data">......</td>`;
        html += `</tr>`;
        return html;
    };

    var generateMetadataTable = function (results) {
window.console.log("generateMetadataTable..");
            var html = "";
            html+=`
<thead>
<tr>
        <th class="text-center button-container" style="width:2rem">
        </th>
        <th class="hoverColor" style="width:5rem" >Id&nbsp<span></span></th>
        <th class="hoverColor" onClick="sortMetadataTableByRow(2,'a')">Fault Name&nbsp<span id='sortCol_2' class="fas fa-angle-down"></span></th>
        <th class="hoverColor" onClick="sortMetadataTableByRow(3,'a')">Site Name&nbsp<span id='sortCol_3' class="fas fa-angle-down"></span></th>
        <th class="hoverColor" onClick="sortMetadataTableByRow(4,'n')" style="width:9rem">X&nbsp<span id='sortCol_4' class="fas fa-angle-down"></span></th>
        <th class="hoverColor" onClick="sortMetadataTableByRow(5,'n')" style="width:9rem">Y&nbsp<span id='sortCol_5' class="fas fa-angle-down"></span></th>
        <th class="hoverColor" onClick="sortMetadataTableByRow(6,'n')" style="width:5rem">Low<br>Rate&nbsp<span id='sortCol_6' class="fas fa-angle-down"></span></th>
        <th class="hoverColor" onClick="sortMetadataTableByRow(7,'n')" style="width:5rem">High<br>Rate&nbsp<span id='sortCol_7' class="fas fa-angle-down"></span></th>
        <th style="width:20%;"><div class="col text-center">
<!--download all -->
                <div class="btn-group download-now">
                    <button id="download-all" type="button" class="btn btn-dark" value="metadata"
                            onclick="CSM.downloadURLsAsZip(this.value);" disabled>
                            DOWNLOAD&nbsp<span id="download-counter"></span>
                    </button>
<!--
                    <button id="download-all" type="button" class="btn btn-dark dropdown-toggle" data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false" disabled>
                            DOWNLOAD&nbsp<span id="download-counter"></span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-right">
                       <button class="dropdown-item" type="button" value="metadata"
                            onclick="CSM.downloadURLsAsZip(this.value);">metadata
                       </button>
                    </div>
-->
                </div>
        </th>
</tr>
</thead>
<tbody>`;

            for (let i = 0; i < results.length; i++) {
                html += generateMetadataTableRow(results[i]);
            }
            if (results.length == 0) {
                html += tablePlaceholderRow;
            }
            html=html+"</tbody>";
            return html;
        };

       var changeMetadataTableBody = function (results) {

            var html = "";
            for (let i = 0; i < results.length; i++) {
                html += generateMetadataTableRow(results[i]);
            }
            if (results.length == 0) {
                html += tablePlaceholderRow;
            }
            return html;
        };

   
        this.replaceMetadataTableBody = function(results) {
            $("#metadata-table tbody").html(changeMetadataTableBody(results));
        };

        this.replaceMetadataTable = function(results) {
            $("#metadata-table").html(generateMetadataTable(results));
        };

/********************* reset functions **************************/
        this.toDraw = function () {
          if( this.searchingType == this.searchType.latlon) { 
            return true;
          }
          return false;
        }

        this.resetLatLon = function () {
          if( this.searchingType != this.searchType.latlon) return;
          $("#csm-firstLatTxt").val("");
          $("#csm-firstLonTxt").val("");
          $("#csm-secondLatTxt").val("");
          $("#csm-scecondLonTxt").val("");
          skipRectangle();
          remove_bounding_rectangle_layer();
          $("#csm-latlon").hide();
        }

        this.resetFaultname = function () {
          if( this.searchingType != this.searchType.faultname) return;
          $("#csm-faultnameTxt").val("");
          $("#csm-fault-name").hide();
        }
        this.resetSitename = function () {
          if( this.searchingType != this.searchType.sitename) return;
          $("#csm-sitenameTxt").val("");
          $("#csm-site-name").hide();
        }

        this.resetMinrate = function () {
          this.resetMinrateSlider();
          resetMinrateRangeColor(csm_minrate_min, csm_minrate_max);
          removeKey(); 
	  $("#csm-minrate-slider").hide();
        }

        this.resetMaxrate = function () {
          this.resetMaxrateSlider();
          resetMaxrateRangeColor(csm_maxrate_min, csm_maxrate_max);
          removeKey();
	  $("#csm-maxrate-slider").hide();
        }

        var resetMinrateRangeColor = function (target_min, target_max){
          let minRGB= makeRGB(target_min, csm_minrate_max, csm_minrate_min );
          let maxRGB= makeRGB(target_max, csm_minrate_max, csm_minrate_min );
          let myColor="linear-gradient(to right, "+minRGB+","+maxRGB+")";
          $("#slider-minrate-range .ui-slider-range" ).css( "background", myColor );
        }

        this.resetMinrateSlider = function () {
          if( this.searchingType != this.searchType.minrate) return;
          $("#slider-minrate-range").slider('values', 
                              [csm_minrate_min, csm_minrate_max]);
          $("#csm-minMinrateSliderTxt").val(csm_minrate_min);
          $("#csm-maxMinrateSliderTxt").val(csm_minrate_max);
        }

        var resetMaxrateRangeColor = function (target_min, target_max){
          let minRGB= makeRGB(target_min, csm_maxrate_max, csm_maxrate_min );
          let maxRGB= makeRGB(target_max, csm_maxrate_max, csm_maxrate_min );
          let myColor="linear-gradient(to right, "+minRGB+","+maxRGB+")";
          $("#slider-maxrate-range .ui-slider-range" ).css( "background", myColor );
        }

        this.resetMaxrateSlider = function () {
          if( this.searchingType != this.searchType.maxrate) return;
          $("#slider-maxrate-range").slider('values', 
                              [csm_maxrate_min, csm_maxrate_max]);
          $("#csm-minMaxrateSliderTxt").val(csm_maxrate_min);
          $("#csm-maxMaxrateSliderTxt").val(csm_maxrate_max);
        }

        this.refreshMaxrateSlider = function () {
          if( this.searchingType != this.searchType.maxrate) return;
          let maxrate_min=$("#csm-minMaxrateSliderTxt").val();
          let maxrate_max=$("#csm-maxMaxrateSliderTxt").val();
          $("#slider-maxrate-range").slider('values', 
                              [maxrate_min, maxrate_max]);
        }

        this.refreshMinrateSlider = function () {
          if( this.searchingType != this.searchType.minrate) return;
          let minrate_min=$("#csm-minMinrateSliderTxt").val();
          let minrate_max=$("#csm-maxMinrateSliderTxt").val();
          $("#slider-minrate-range").slider('values', 
                              [minrate_min, minrate_max]);
        }

/********************* marker color function **************************/
// marker.scec_properties.high_rate_color, marker.sce_properties.low_rate_color
// toMake == 1, set the scec_properties color values
        this.makeLayerColors = function() {
            let lsz = this.csm_layers.length;
            for(let i=0; i<lsz; i++) {
                let layer=this.csm_layers[i];
                let hr = layer.scec_properties.high_rate;
                let lr = layer.scec_properties.low_rate;
                layer.scec_properties.low_rate_color = makeRGB(lr, csm_minrate_max, csm_minrate_min );
                layer.scec_properties.high_rate_color = makeRGB(hr, csm_maxrate_max, csm_maxrate_min );
            }
        }

        this.replaceColor = function(layer) {
            let myColor = site_colors.normal;

            let hr = layer.scec_properties.high_rate;
            let lr = layer.scec_properties.low_rate;
            if( this.searchingType == this.searchType.minrate) {
                myColor = layer.scec_properties.low_rate_color;
            }
            if( this.searchingType == this.searchType.maxrate) {
                myColor = layer.scec_properties.high_rate_color;
            }
            if(layer.scec_properties.selected) {
                myColor = site_colors.selected;
            }
            layer.setStyle({fillColor:myColor, color:myColor});
       }

       this.resetActiveLayerColor = function () {
            this.csm_active_layers.remove();

window.console.log(" ==> here in replace color");
            let layers=this.csm_active_layers;

            layers.eachLayer(function(layer) {
              layer.resetStyle();
            });

            this.csm_active_layers.addTo(viewermap);
       }


/********************* sliprate INTERFACE function **************************/
        this.setupCPDInterface = function() {

            var $result_table = $('#result-table');
            $result_table.floatThead('destroy');
            $("#result-table").html(makeResultTable(csm_meta_data));
            $result_table.floatThead({
                 scrollContainer: function ($table) {
                     return $table.closest('div#result-table-container');
                 },
            });

            let elt=document.getElementById("dataset_sliprate");
            elt.click();

            $("#csm-controlers-container").css('display','');
            $("#csm-sliprate-controlers-container").css('display','none');

            $("div.mapData div.map-container").css('padding-left','30px');

            var $download_queue_table = $('#metadata-table');
            $download_queue_table.floatThead('destroy');
            this.replaceMetadataTable([]);
            $download_queue_table.addClass('sliprate');
            $download_queue_table.floatThead({
                 scrollContainer: function ($table) {
                     return $table.closest('div#metadata-table-container');
                 },
            });

            this.activateData();

            viewermap.invalidateSize();
            let bounds = L.latLngBounds(this.csm_markerLocations);
            viewermap.fitBounds(bounds);

/* setup  sliders */
            $("#slider-minrate-range").slider({ 
                  range:true, step:0.01, min:csm_minrate_min, max:csm_minrate_max, values:[csm_minrate_min, csm_minrate_max],
              slide: function( event, ui ) {
                           $("#csm-minMinrateSliderTxt").val(ui.values[0]);
                           $("#csm-maxMinrateSliderTxt").val(ui.values[1]);
                           resetMinrateRangeColor(ui.values[0],ui.values[1]);
                     },
              change: function( event, ui ) {
                           $("#csm-minMinrateSliderTxt").val(ui.values[0]);
                           $("#csm-maxMinrateSliderTxt").val(ui.values[1]);
                           resetMinrateRangeColor(ui.values[0],ui.values[1]);
                     },
              stop: function( event, ui ) {
                           let searchType = CSM.searchType.minrate;
                           CSM.search(searchType, ui.values);
                     },
              create: function() {
                          $("#csm-minMinrateSliderTxt").val(csm_minrate_min);
                          $("#csm-maxMinrateSliderTxt").val(csm_minrate_max);
                    }
            });
            $('#slider-minrate-range').slider("option", "min", csm_minrate_min);
            $('#slider-minrate-range').slider("option", "max", csm_minrate_max);

/* setup  sliders */
            $("#slider-maxrate-range").slider({ 
                  range:true, step:0.01, min:csm_maxrate_min, max:csm_maxrate_max, values:[csm_maxrate_min, csm_maxrate_max],
              slide: function( event, ui ) {
                           $("#csm-minMaxrateSliderTxt").val(ui.values[0]);
                           $("#csm-maxMaxrateSliderTxt").val(ui.values[1]);
                           resetMaxrateRangeColor(ui.values[0],ui.values[1]);
                     },
              change: function( event, ui ) {
                           $("#csm-minMaxrateSliderTxt").val(ui.values[0]);
                           $("#csm-maxMaxrateSliderTxt").val(ui.values[1]);
                           resetMaxrateRangeColor(ui.values[0],ui.values[1]);
                     },
              stop: function( event, ui ) {
                           let searchType = CSM.searchType.maxrate;
                           CSM.search(searchType, ui.values);
                     },
              create: function() {
                          $("#csm-minMaxrateSliderTxt").val(csm_maxrate_min);
                          $("#csm-maxMaxrateSliderTxt").val(csm_maxrate_max);
                    }
            });
            $('#slider-maxrate-range').slider("option", "min", csm_maxrate_min);
            $('#slider-maxrate-range').slider("option", "max", csm_maxrate_max);
    };

/******************  Result table functions **************************/
    function makeResultTableBody(json) {

        var html="<tbody id=\"result-table-body\">";
        var sz=json.length;

        var tmp="";
        for( var i=0; i< sz; i++) {
           var s=json[i];
           var gid=parseInt(s.gid);
           var name=s.faultname + " | " +s.sitename;
           var t="<tr id=\"row_"+gid+"\"><td style=\"width:25px\"><button class=\"btn btn-sm cxm-small-btn\" id=\"button_"+gid+"\" title=\"highlight the fault\" onclick=CSM.toggleSiteSelectedByGid("+gid+")><span id=\"sliprate-result-gid_"+gid+"\" class=\"glyphicon glyphicon-unchecked\"></span></button></td><td><label for=\"button_"+gid+"\">" + name + "</label></td></tr>";
           tmp=tmp+t;
        }
        html=html+ tmp + "</tbody>";

        return html;
    }

    function replaceResultTableBodyWithGids(glist) {

        var html="";
        var sz=glist.length;

        for( var i=0; i< sz; i++) {
           let gid=glist[i];
           let layer=CSM.getLayerByGid(gid);
           let s=layer.scec_properties;
           let name= s.fault_name + " | " +s.site_name;

           var t="<tr id=\"row_"+gid+"\"><td style=\"width:25px\"><button class=\"btn btn-sm cxm-small-btn\" id=\"button_"+gid+"\" title=\"highlight the fault\" onclick=CSM.toggleSiteSelectedByGid("+gid+")><span id=\"sliprate-result-gid_"+gid+"\" class=\"glyphicon glyphicon-unchecked\"></span></button></td><td><label for=\"button_"+gid+"\">" + name + "</label></td></tr>";
           html=html+t;
        }

        document.getElementById("result-table-body").innerHTML = html;
    }


    function makeResultTable(json) {
        var html="";
        html+=`
<thead>
<tr>
   <th class='text-center'><button id=\"csm-allBtn\" class=\"btn btn-sm cxm-small-btn\" title=\"select all visible sliprate sites\" onclick=\"CSM.toggleSelectAll();\"><span class=\"glyphicon glyphicon-unchecked\"></span></button></th>
<th class='myheader'>CPD Site Location ( fault | site )</th>
</tr>
</thead>`;
        var body=makeResultTableBody(json);
        html=html+ "<tbody>" + body + "</tbody>";

        return html;
    }

/********************** zip utilities functions *************************/
    this.downloadURLsAsZip = function(ftype) {
        var nzip=new JSZip();
        var layers=CSM.csm_active_layers.getLayers();
        let timestamp=$.now();
        let mlist=[];
      
        var cnt=layers.length;
        for(var i=0; i<cnt; i++) {
          let layer=layers[i];

          if( !layer.scec_properties.selected ) {
            continue;
          }

          if(ftype == "metadata" || ftype == "all") {
          // create metadata from layer.scec_properties
            let m=createMetaData(csm_meta_data[layer.scec_properties.idx]);
            mlist.push(m);
          }
      
/***** this is for downloading some generated file from the result directory..
          if(ftype == "extra") {
            let downloadURL = getDataDownloadURL(layer.scec_properties.csm_id);
            let dname=downloadURL.substring(downloadURL.lastIndexOf('/')+1);
            let promise = $.get(downloadURL);
            nzip.file(dname,promise);
          }
***/
        }

/**
        var zipfname="CSM_"+timestamp+".zip"; 
        nzip.generateAsync({type:"blob"}).then(function (content) {
          // see FileSaver.js
          saveAs(content, zipfname);
        })
***/

        if(mlist.length != 0) {
//        saveAsJSONBlobFile(mlist, timestamp)
          var data=getCSVFromMeta(mlist);
          saveAsCSVBlobFile(data, timestamp);
        }
    };


    function getCSVFromMeta(mlist) {
        var len=mlist.length;  // each data is a meta data format
        var last=len-1;

    // grab the first meta data and generate the title..
        var meta=mlist[0];
        var keys=Object.keys(meta);
        var jlen=keys.length;
        
//        var csvblob = keys.join(",");
        var csvblob=sliprate_csv_keys[keys[0]];
        for(let k=1; k< jlen; k++) {
           csvblob += (','+sliprate_csv_keys[keys[k]]);
        }
        csvblob +='\n';

        for(let i=0; i< len; i++) {
            let j=0;
            meta=mlist[i];
            var values=Object.values(meta)
            var vblob=JSON.stringify(values[0]);
            for(j=1; j< jlen; j++) {
                var vv=values[j];
                if(vv != null) {
                  if(isNaN(vv)) {
                    vblob=vblob+","+ JSON.stringify(vv);
                    } else {
                      vblob=vblob+","+vv;
                  }
                  } else {
                    vblob=vblob+",";
                }
            }
            csvblob += vblob;
            if(i != last) {
            csvblob +='\n';
            }
        }
//http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        return csvblob;
    }
	      
};
