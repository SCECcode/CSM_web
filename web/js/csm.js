/***
   csm.js

   needs to track the 'depths' per models ??
   also need to track different models
***/

var CSM = new function () {

    // complete set of csm models
    // include the meta data info
    // { "gid":gid, "model_name":mn, "table_name":tn, "meta":meta } 
    this.csm_models = [];

    // locally used, floats
    var csm_depth_min=undefined;
    var csm_depth_max=undefined;

    var site_colors = {
        normal: '#006E90',
        selected: '#B02E0C',
        abnormal: '#00FFFF',
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

    this.activateData = function() {
        this.showOnMap();
        $("div.control-container").hide();
        $("#csm-controls-container").show();

    };

/********** show layer/select functions *********************/

// csm_meta_data is from viewer.php, which is the JSON 
// result from calling php getAllMetaData script
    this.processModelMeta = function () {
        for (const index in csm_meta_data) {
          if (csm_meta_data.hasOwnProperty(index)) {
		let tmp = csm_meta_data[index];
                let jmeta = JSON.parse(tmp.meta);

                let term = {
                    idx: index,
                    gid: tmp.gid,
                    model_name: tmp.model_name,
                    table_name: tmp.table_name,
                    meta: jmeta,
                };
                this.csm_models.push(term);
            }
        }
    };

    // create a all model layer with circle markers with
    //  with table_name, depth, "alphi" 
    //  lat,lon,val
    // ie. meta_data,
    // aphi_max, alphi_min,dep
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


/********** search/layer  functions *********************/
    this.showSearch = function (type) {
        const $all_search_controls = $("#csm-search-control ul li");
        $all_search_controls.hide();
        switch (type) {
            case this.searchType.latlon:
                $("#csm-latlon").show();
                drawRectangle();
                break;
            default:
                // no action
        }
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

        // go back to default view,
window.console.log("call setView.. default");
        viewermap.setView(this.defaultMapView.coordinates, this.defaultMapView.zoom);
    };

// reset just the search only
    this.resetSearch = function (){
window.console.log("calling --->> resetSearch.");
        this.resetLatLonSearch();
    };

// a complete fresh search
    this.freshSearch = function (t){

        this.resetSearch();

        const $all_search_controls = $("#csm-controls-container ul li")
window.console.log("calling freshSearch..");
        switch (t) {
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

    // search with table_name, depth, type (ie. alphi)
    // expect at most 80k lat/lon/val
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

        $.ajax({
            url: "php/search.php",
            data: {t: type, q: JSON_criteria},
        }).done(function(search_result) {
            let latlist;
            let lonlist;
            let vallist;
            if(search_result === "[]") {
window.console.log("Did not find any PHP result");
            } else {
                let tmp=JSON.parse(search_result); 
                latlist=tmp['lat'];
                lonlist=tmp['lon'];
                vallist=tmp['val'];
                return(latlist,lonlist,vallist);
            }
        });
        return([],[],[]);
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
                 
        // get latlist, lonlist, valist);
        this.search(CSM.searchType.latlon, criteria);

        let regionLocations = [];
        regionLocations.push(L.latLng(criteria[0],criteria[1]));
        regionLocations.push(L.latLng(criteria[2],criteria[3]));
        let bounds = L.latLngBounds(regionLocations);
window.console.log("flyingBounds --latlon");
        viewermap.flyToBounds(bounds);
    };

/********** metadata  table functions *********************/
// with info about mode, depth, type 
    this.addToMetadataTable = function(layer) {
        let $table = $("#metadata-table tbody");
        let gid = layer.scec_properties.gid;
        if ($(`tr[csm-metadata-gid='${gid}'`).length > 0) {
            return;
        }
        let html = generateMetadataTableRow(layer);
        $table.prepend(html);
    };

    this.removeFromMetadataTable = function (gid) {
        $(`#metadata-table tbody tr[csm-metadata-gid='${gid}']`).remove();
    };

    var generateMetadataTableRow = function(layer) {
        let $table = $("#metadata-table");
        let html = "";

        html += `<tr csm-metadata-gid="${layer.scec_properties.gid}">`;

        html += `<td><button class=\"btn btn-sm cxm-small-btn\" id=\"button_meta_${layer.scec_properties.gid}\" title=\"remove the site\" onclick=CSM.unselectSiteByGid("${layer.scec_properties.gid}");><span id=\"csm_metadata_${layer.scec_properties.gid}\" class=\"glyphicon glyphicon-trash\"></span></button></td>`;
        html += `<td class="meta-data">${layer.scec_properties.depth}</td>`;
        html += `<td class="meta-data">${layer.scec_properties.note} </td>`;
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
        <th class="hoverColor" onClick="sortMetadataTableByRow(2,'a')">Dataset Name&nbsp<span id='sortCol_2' class="fas fa-angle-down"></span></th>
        <th class="hoverColor" onClick="sortMetadataTableByRow(3,'n')">Depth&nbsp<span id='sortCol_3' class="fas fa-angle-down"></span></th>
        <th class="hoverColor">Note&nbsp</th>
        <th style="width:20%;"><div class="col text-center">
<!--download all -->
                <div class="btn-group download-now">
                    <button id="download-all" type="button" class="btn btn-dark" value="metadata"
                            onclick="CSM.downloadURLsAsZip(this.value);" disabled>
                            DOWNLOAD&nbsp<span id="download-counter"></span>
                    </button>
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

        this.reseteitename = function () {
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


/********************* csm INTERFACE function **************************/
       this.setupCSMInterface = function() {

            $("#csm-controlers-container").css('display','');
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

            // setup the modelType list from this.csm_models,
            for (const idx in this.csm_models) {
               let term=this.csm_models[idx];
window.console.log("HERE");
		    /*
                    idx: index,
                    gid: tmp.gid,
                    model_name: tmp.model_name,
                    table_name: tmp.table_name,
                    meta: jmeta,
		    */
               
	      var elt=document.getElementById('modelType');
              let option = document.createElement("option");
              option.text = term.model_name;
              option.label = term.model_name;
              option.value= term.idx;
              elt.add(option);

		    /*
	    var elt=document.getElementById('modelType');
            let option = document.createElement("option");
            option.text = mname;
            option.label = mname;
            option.value= aname;
            sel.add(option);
	           */
            }

       };

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
