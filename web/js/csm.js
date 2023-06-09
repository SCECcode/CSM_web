/***
   csm.js

   needs to track the 'depths' per models ??
   also need to track different models
***/

var CSM = new function () {

    // 
    // complete set of csm models info from the backend-service,
    // { "gid":gid, "model_name":mn, "table_name":tn, "jblob":jblob } 
    // and,
    //   jblob's format
    //   { "model": mn,
    //     "meta": { "dataCount": cnt, "dataByDEP": [ { "dep":d, "cnt":lcnt,  "aphi_max":max, "aphi_min":min}..] },
    //     "aphiRange": [mmax, mmin],
    //     "metric" : [ "aphi" ] }
    this.csm_models = [];

    //  pixi layers for for each model metric for each depth, 
    //  made on-demand
    //  csm_model_pixi_layers['model_id]['metric_id']['depth_id']
    //  to avoid generate these repeatly
    this.csm_model_pixi_layers;

    // { "gid":gid, "layer": layer } 
    // from searchLatlon, to be downloaded
    this.csm_pixi_layers = [];

    this.current_pixi_gid=0;

    this.current_modelDepth_idx=undefined; 
    this.current_modelMetric_idx=undefined; 

    // locally used, floats
    var csm_depth_min=undefined;
    var csm_depth_max=undefined;

    var site_colors = {
        normal: '#006E90',
        selected: '#B02E0C',
        abnormal: '#00FFFF',
    };

    this.defaultMapView = {
        coordinates: [34.0, -118.2],
        zoom: 7 
    };

    this.searchType = {
        none: 'none', 
        model: 'model',
        latlon: 'latlon'
    };

    this.searchingType=this.searchType.model;
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
                let jblob = JSON.parse(tmp.jblob);

                let term = {
                    idx: index,
                    gid: tmp.gid,
                    model_name: tmp.model_name,
                    table_name: tmp.table_name,
                    jblob: jblob,
                };
                this.csm_models.push(term);
            }
        }
    };

    // create a all model layer with circle markers with
    //  with table_name, depth, "aphi" 
    //  lat,lon,val
    // ie. meta_data,
    // aphi_max, aphi_min,dep
    this.createActiveLayerGroupWithGids = function(glist) {

        // remove the old ones and remove from result table
        this.clearAllSelections()
        this.csm_active_layers.remove();
        this.csm_active_layers= new L.FeatureGroup();
        this.csm_active_gid=[];
        this.csm_active_markerLocations = [];

        let gsz=glist.length;
        let lsz= this.csm_pixi_layers.length;
        let i_start=0;

        for (let j=0; j<gsz; j++) {
          let gid=glist[j];
          for (let i=i_start; i< lsz; i++) {
            let layer = this.csm_pixi_layers[i];
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

        this.searchingType = type;
        switch (type) {
            case this.searchType.none:
               $("#csm-search-btn").css('display','none');
               $("#csm-model").hide();
               $("#csm-latlon").hide();
               skipRectangle();
               break;
            case this.searchType.model:
        // enable search btn
               $("#csm-search-btn").css('display','');
               $("#csm-model").show();
               $("#csm-latlon").hide();
               skipRectangle();
               break;
            case this.searchType.latlon:
        // enable search btn
               $("#csm-search-btn").css('display','');
        // enable latlon 
               $("#csm-model").hide();
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
    this.resetAll = function () {

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
        viewermap.setView(this.defaultMapView.coordinates, this.defaultMapView.zoom);
        // reset model/metric to initial state
     CSM.resetModelType();

    };

// reset just the search only
    this.resetSearch = function (){
window.console.log("calling --->> resetSearch.");
        $("#csm-search-btn").css('display','none');
        this.resetModel();
        this.resetLatlon();
    };

    this.freshSearch = function (){

window.console.log("XX new freshSearch...");

      // retrieve model's database table name
      // depth value  
      // which metric type
         
      let tidx=parseInt($("#modelType").val());
      let model=this.csm_models[tidx];
      let tmodel=model['table_name'];
      window.console.log("name is ", model['table_name']);

      let didx=this.current_modelDepth_idx; 
      let d=model['jblob']['meta'];
      let dd=d['dataByDEP'];
      let ddd=dd[didx];
      let ddepth=ddd["dep"];
      window.console.log("modelDepth_idx is "+didx+"("+ddepth+"km)");

      let midx=this.current_modelMetric_idx; 
      let m=model['jblob']['metric'];
      let mmetric=m[midx];
      window.console.log("modelMetric_idx is "+midx+"("+mmetric+")");

// initiate search if it is for whole model or
// wait for a region 
      if(this.searchingType == this.searchType.model) {
window.console.log(tidx,midx,didx);
        var pixilayer= CSM.lookupModelLayers(tidx,midx,didx);

        if(pixilayer) { // reuse and add to viewer map 
          clearAllPixiOverlay();
          viewermap.addLayer(pixilayer);
          } else {
            let spec = [ tmodel, ddepth, mmetric ];
            let other = [ tidx,midx,didx ];
            pixilayer = this.search(this.searchType.model, spec, other);
        }
      } else {
      }
    };

    this.startWaitSpin = function() {
      $("#csm-wait-spin").css('display','');
    }
    this.removeWaitSpin = function() {
      $("#csm-wait-spin").css('display','none');
    }

    // search with table_name, depth, type (ie. aphi)
    // expect at most 80k lat/lon/val
    // criteria is lat,lon,lat2,lon2 for searching with LatLon
    // 	        is tidx,midx,didx for storing the pixi into a list	
    this.search = function(type, spec, criteria) {

        CSM.startWaitSpin();

        let tmp=criteria;
        if(type==CSM.searchType.model) { tmp = []; }
        if (!Array.isArray(tmp)) { tmp = [tmp]; }

        let JSON_criteria = JSON.stringify(tmp);
        let JSON_spec = JSON.stringify(spec);

        $.ajax({
            url: "php/search.php",
            data: {t: type, s: JSON_spec, q: JSON_criteria},
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

                clearAllPixiOverlay();
                this.current_pixi_gid++;

                let spec = {'data_max':3.0, 'data_min':1.0};

                var pixi=makePixiOverlayLayerWithList(
                         this.current_pixi_gid,
                         latlist,lonlist,vallist,spec);
                CSM.removeWaitSpin();

                if(type==CSM.searchType.model) {
                    CSM.addModelLayers(criteria[0],criteria[1],criteria[2],pixi);
                }
		return pixi;
            }
        });
    };

    // special case, Latlon can be from text inputs or from the map
    // fromWhere=0 is from text
    // fromWhere=1 from drawRectangle call
    this.searchLatlon = function (fromWhere, rect) {
        let criteria = [];
        let spec = [];
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

        let pixi= this.search(CSM.searchType.latlon, spec, criteria);

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

        this.resetModel = function () {
          $("#csm-model").hide();
        }

        this.resetLatlon = function () {
          if( this.searchingType != this.searchType.latlon) return;
          $("#csm-firstLatTxt").val("");
          $("#csm-firstLonTxt").val("");
          $("#csm-secondLatTxt").val("");
          $("#csm-scecondLonTxt").val("");
          skipRectangle();
          remove_bounding_rectangle_layer();
          $("#csm-latlon").hide();
        }

/********************* marker color function **************************/
// marker.scec_properties.high_rate_color, marker.sce_properties.low_rate_color
// toMake == 1, set the scec_properties color values
        this.makeLayerColors = function() {
            let lsz = this.csm_pixi_layers.length;
            for(let i=0; i<lsz; i++) {
                let layer=this.csm_pixi_layers[i];
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
              /*
                    idx: index,
                    gid: tmp.gid,
                    model_name: tmp.model_name,
                    table_name: tmp.table_name,
                    jblob: jblob,
              */
               
             var elt=document.getElementById('modelType');
                let option = document.createElement("option");
                option.text = term.model_name;
                option.label = term.model_name;
                option.value= term.idx;
                elt.add(option);
            }
/* create the default model depth list to 1st one for model */
            this.setupModelDepth(this.csm_models,0);
            this.setupModelMetric(this.csm_models,0);
            this.setupModelLayers(this.csm_models);
    };
     
    // need to trigger modelType change to first model
    this.resetModelType = function () {
window.console.log("resetModelType");
       let elt=document.getElementById('modelType');
       elt.value = 0;
       $("#modelType").change();
    }

    // mlist,
    // { "gid":gid, "model_name":mn, "table_name":tn, "jblob":jblob }
    // and,
    //   jblob's format
    //   { "model": mn,
    //     "meta": { "dataCount": cnt, "dataByDEP": [ { "dep":d, "cnt":lcnt,  "aphi_max":max, "aphi_min":min}..] },
    //     "aphiRange": [mmax, mmin],
    //     "metric" : [ "aphi" ] }
  
    //  csm_model_pixi_layers['model_id]['metric_id']['depth_id']
    this.setupModelLayers = function (mlist) {
      let msz=mlist.length;
      this.csm_model_pixi_layers=[];
      for(let i=0; i<msz; i++) {
        this.csm_model_pixi_layers[i]=[]; // per model
        let mmlist=mlist[i]['jblob']['metric'];
        let mmsz=mmlist.length;
        for(let j=0; j<mmsz; j++) {
           this.csm_model_pixi_layers[i][j]=[]; // per metric
           let dlist=mlist[i]['jblob']['meta']['dataByDEP'];
           let dsz=dlist.length;
           for(let k=0; k<dsz; k++) {
             this.csm_model_pixi_layers[i][j][k]=undefined; // per depth
           }
        }
      }
    };

    this.lookupModelLayers = function (midx, mmidx, didx) {
//window.console.log(" ===> LOOKING FOR", midx, mmidx, didx);
      let alayer=CSM.csm_model_pixi_layers[midx][mmidx][didx];
      if(alayer != undefined) {
//        window.console.log(" === FOUND an existing layer..");
        return alayer;
        } else {
//          window.console.log(" === DID not Find an existing layer..");
          return null;
      }
    } 
    this.addModelLayers = function(midx,mmidx,didx,pixilayer) {
//window.console.log(" ===> ADDING FOR", midx, mmidx, didx);
      let alayer=CSM.csm_model_pixi_layers[midx][mmidx][didx];
      if(alayer != undefined) {
        window.console.log(" === BAD BAD BAD - found  an existing layer..");
        } else {
          CSM.csm_model_pixi_layers[midx][mmidx][didx]=pixilayer;
      }
    } 

    this.setupModelMetric = function (mlist,model_idx) {
      let dlist=mlist[model_idx]['jblob']['metric'];
      let sz=dlist.length;
      let html="";
      for(let i=0;i<sz;i++) {  
         let label=dlist[i];
         let h=_metricoption(label,i);
         html=html+h;
         if( (i+1) % 5 === 0 ) {
            html=html+"<br>";
         }            
      }
      $("#modelMetric-options").html(html);
      $("#modelMetric_0").click();
    };
    // set to first metric
    this.resetModelMetric = function () {
      $("#modelMetric_0").click();
    };

    function _metricoption(label,idx) {
      var html = "<input type=\"radio\" class='mr-1' id=\"modelMetric_"+idx+"\" name=\"modelMetric_idx\" onclick=\"CSM.changeModelMetric("+idx+")\">";
          html=html+"<label class='form-check-label mr-2 mini-option' for=\"modelMetric_\"+idx+\"><span>"+label+"</span></label>";
      return html;
    }

    this.setupModelDepth = function (mlist,model_idx) {
      let jblob=mlist[model_idx]['jblob'];
      let dlist=jblob['meta']['dataByDEP'];
      let sz=dlist.length;
      let html="";

      for(let i=0;i<sz;i++) {  
         let term=dlist[i];
         let label=term['dep'];
         let h=_depthoption(label,i);
         html=html+h;
         if( (i+1) % 5 === 0 ) {
            html=html+"<br>";
         }            
       }

       $("#modelDepth-options").html(html);
       $("#modelDepth_0").click();
    };
    // reset to depth of 0
    this.resetModelDepth = function () {
       $("#modelDepth_0").click();
    };

    /*
        <input class='form-check-inline mr-1'
            type="checkbox" id="modelDepth_1" value=1>
        <label class='form-check-label mr-2 mini-option' for="modelDepth_1">
            <span id="modelDepth_1_string">place_holder</span></label>
    */
    function _depthoption(label,idx) {
      var html = "<input type=\"radio\" class='mr-1' id=\"modelDepth_"+idx+"\" name=\"modelDepth_idx\" onclick=\"CSM.changeModelDepth("+idx+")\">";
          html=html+"<label class='form-check-label mr-2 mini-option' for=\"modelDepth_\"+idx+\"><span>"+label+" km</span></label>";
      return html;
    }

   this.changeModelDepth = function(v) {
        this.current_modelDepth_idx=v; 
   };
   this.changeModelMetric = function(v) {
        this.current_modelMetric_idx=v; 
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
