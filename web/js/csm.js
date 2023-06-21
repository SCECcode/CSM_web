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
    //     "metric" : [ "aphi" ],
    //     "header" : "..." }
    this.csm_models = [];

    //  track pixi gid for for each model metric for each depth, 
    //  made on-demand
    //  csm_model_pixi_layers['model_id]['metric_id']['depth_id']
    //  to avoid generate these repeatly
    this.csm_model_pixi_layers=[];
    this.current_pixi_gid=0;

    // { "gid":gid, "scec_properties": prop, "jblob": jblob } 
    // from searchLatlon, to be downloaded
    // scec_properties : gid, depth, lon1, lat1, lon2, lat2, dataset, note, layer
    // jblob is JSON blob of all the rows from the db query
    this.csm_downloads = [];

    this.current_modelDepth_idx=undefined; 
    this.current_modelMetric_idx=undefined; 

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
    this.searchingType=this.searchType.none;


var csm_csv_keys= {
lon:'LON',
lat:'LAT',
dep:'DEP',
see:'See',
sen:'Sen',
seu:'Seu',
snn:'Snn',
snu:'Snu',
suu:'Suu',
shmax:'SHmax',
shmax_unc:'SHmax_unc',
phi:'phi',
r:'R',
aphi:'Aphi',
iso:'iso',
dif:'dif',
mss:'mss',
s1:'S1',
s2:'S2',
s3:'S3',
v1x:'V1x',
v1y:'V1y',
v1z:'V1z',
v2x:'V2x',
v2y:'V2y',
v2z:'V2z',
v3x:'V3x',
v3y:'V3y',
v3z:'V3z',
v1pl:'V1pl',
v2pl:'V2pl',
v3pl:'V3pl',
v1azi:'V1azi',
v2azi:'V2azi',
v3azi:'V3azi',
};

    var tablePlaceholderRow = `<tr id="placeholder-row">
                        <td colspan="9">Metadata for selected region will appear here.</td>
                    </tr>`;

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
// clear the pixi layer and also pixi segment 
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

        // reset search type
	CSM.resetSearchType();

        // clear pixi layer
        pixiClearAllPixiOverlay();
        CSM.setupPixiSegment(0);
   };
 
   // given a dataset's db_tb name, return matching dataset name
   this.lookupDataset = function(tb_nm) {
        let sz=this.csm_models.length;
        for( let i=0; i<sz; i++) {
          let term=this.csm_models[i];
          if(term.table_name == tb_nm) { 
            return term.model_name;
          }
        }
        return("bad model");
   };             

// reset just the search only
    this.resetSearch = function (){
window.console.log("calling --->> resetSearch.");
        $("#csm-search-btn").css('display','none');
        this.resetModel();
        this.resetLatlon();
    };

// HOW TO DEFINE spec

    this.getSpec = function() {
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

      let spec = [ tmodel, ddepth, mmetric ];
      let spec_idx = [ tidx,midx,didx ];

window.console.log("spec is: ",spec);
window.console.log("spec_idx is: ",spec_idx);

      return [spec, spec_idx];
    }

    this.freshSearch = function (){

window.console.log("calling, new freshSearch...");

     // retrieve model's database table name
     // depth value  
     // which metric type
         
      let spec = [];
      let spec_idx = [];
      [ spec, spec_idx ] = this.getSpec();

// initiate search if it is for whole model or
// wait for a region 

      if(this.searchingType == this.searchType.model) {
window.console.log("in freshSearch --model");
        var pixigid= CSM.lookupModelLayers(
                       spec_idx[0], spec_idx[1], spec_idx[2]);

        pixiClearAllPixiOverlay();
        CSM.setupPixiSegment(0);

        if(pixigid != null) { // reuse and add to viewer map 
          let pixioverlay=pixiFindOverlayWithGid(pixigid);
          viewermap.addLayer(pixioverlay);
          let cnt=pixiFindSegmentWithGid(pixigid);
          CSM.setupPixiSegment(cnt);
          } else {
            pixigid = this.search(this.searchType.model, spec, spec_idx);
        }

        return;
      }

      if(this.searchingType == this.searchType.latlon) {
window.console.log("in freshSearch --latlon");
         this.searchLatlon(0, []);
      }
    };

// a layer is always generated with the full set of segments 
// so pop up the pixi segment selector on dashboard
// max n would be 20
   function _segmentoption(label,idx) {
      var html = "<input type=\"checkbox\" class='mr-1' id=\"pixiSegment_"+idx+"\" onclick=\"CSM.togglePixiSegment("+idx+")\" checked >";
          html=html+"<label class='form-check-label mr-2 mini-option' for=\"pixiSegment_\"+idx+\"><span>"+label+"</span></label>";
      return html;
    }

    this.setupPixiSegment = function(n) {
      if(n>20) return;
      let html = "";
      for(let i=0; i<n; i++) {
	 html=html+_segmentoption(i,i);
	 if( (i+1) % 8 === 0 ) {
             html=html+"<br>";
         }
      }
      $("#pixi-segment").html(html);
    }

    this.togglePixiSegment = function(n) {
      let gid=this.current_pixi_gid;
window.console.log("calling togglePixiSegment.. with ",n,"on ",gid);
      pixiToggleMarkerContainer(gid,n);
    }

    this.startWaitSpin = function() {
      $("#csm-wait-spin").css('display','');
    }
    this.removeWaitSpin = function() {
      $("#csm-wait-spin").css('display','none');
    }

    // search with table_name, depth, type (ie. aphi)
    // expect at most 80k lat/lon/val
    // criteria is lat,lon,lat2,lon2 for searching with LatLon
    //              is tidx,midx,didx for storing the pixi into a list     
    this.search = function(type, spec, criteria) {

        CSM.startWaitSpin();

        let tmp=criteria;
        if(type==CSM.searchType.model) { tmp = []; }
        if (!Array.isArray(tmp)) { tmp = [tmp]; }

        let JSON_criteria = JSON.stringify(tmp);
        let JSON_spec = JSON.stringify(spec);
        let dataset=this.lookupDataset(spec[0]);

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
                if(type==CSM.searchType.model) { 
                    let tmp=JSON.parse(search_result); 
                    latlist=tmp['lat'];
                    lonlist=tmp['lon'];
                    vallist=tmp['val'];

                    pixiClearAllPixiOverlay();
                    CSM.setupPixiSegment(0);
                    CSM.current_pixi_gid++;

/*  pixi_spec:
       seg_cnt  sets  DATA_SEGMENT_COUNT
       data_max sets  DATA_MAX_V
       data_min sets  DATA_MIN_V
*/
window.console.log("SEARCH :",criteria);

                    let pixi_spec = { 'seg_cnt' : 20};
                    
                    // if metric is "aphi"
                    if( 1 ) {	
                       pixi_spec.data_max=3.0;
                       pixi_spec.data_min=0.0;
                    }

//pixiOverlayList.push({"gid":gid,"vis":1,"overlay":overlay,"top":pixiContainer,"inner":pContainers,"latlnglist":pixiLatlngList});
// returning overlay
                    var pgid=makePixiOverlayLayerWithList(
                             CSM.current_pixi_gid,
                             latlist,lonlist,vallist,pixi_spec);
                    CSM.removeWaitSpin();

                    CSM.addModelLayers(criteria[0],criteria[1],criteria[2],pgid);
                    CSM.setupPixiSegment(pixi_spec.seg_cnt);
                    return pgid;
                }
                if(type==CSM.searchType.latlon) { 
                    let jblob=JSON.parse(search_result); 
                    let sz=jblob.length;
                    if(sz > 0) { 
                      let first = jblob[0];
                      let scec_properties={};
                      let gid = get_bounding_rectangle_layer_idx();
                      scec_properties.gid=gid; 
                      scec_properties.depth=first.dep;
                      scec_properties.lon1=criteria[0];
                      scec_properties.lat1=criteria[1];
                      scec_properties.lon2=criteria[2];
                      scec_properties.lat2=criteria[3];
                      scec_properties.dataset=dataset;
                      scec_properties.note="N="+sz;
                      let result={"scec_properties":scec_properties, "jblob":jblob}; 
                      CSM.csm_downloads.push(result);
                      CSM.addToMetadataTable(result);
                      updateDownloadCounter(CSM.csm_downloads.length);
                      CSM.flyToDownloadBounds();
                      CSM.removeWaitSpin();
                    }        
                    return;
                }
            }
        });
    };

    this.redrawModel = function(v) {
    };
	     
    // special case, Latlon can be from text inputs or from the map
    // fromWhere=0 is from text
    // fromWhere=1 from drawRectangle call
    this.searchLatlon = function (fromWhere, rect) {
window.console.log("calling searchLatlon..");
        let criteria = [];
        let spec = [];
        let spec_info = [];

        [spec, spec_info] = this.getSpec();

        if( fromWhere == 0) {
            let lat1=$("#csm-firstLatTxt").val();
            let lon1=$("#csm-firstLonTxt").val();
            let lat2=$("#csm-secondLatTxt").val();
            let lon2=$("#csm-secondLonTxt").val();
            if(lat1=='' || lon1=='' || lat2=='' || lon2=='') return;
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

        // not expecting anything 
        let ret= this.search(CSM.searchType.latlon, spec, criteria);

/****
        let regionLocations = [];
        regionLocations.push(L.latLng(criteria[0],criteria[1]));
        regionLocations.push(L.latLng(criteria[2],criteria[3]));
        let bounds = L.latLngBounds(regionLocations);
        viewermap.flyToBounds(bounds);
****/
    };

   this.flyToDownloadBounds = function() {
        // collect up all the points
        let len=this.csm_downloads.length;
        let locs=[];

        if(len == 0) { return; }

        for(let i=0; i<len; i++) {
          let tmp=this.csm_downloads[i].scec_properties;
          locs.push(L.latLng(tmp.lon1,tmp.lat1));
          locs.push(L.latLng(tmp.lon2,tmp.lat2));
        }
        let bounds = L.latLngBounds(locs);
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
        $(`#metadata-table tbody tr[id='placeholder-row']`).remove();
    };

    this.removeFromMetadataTable = function (gid) {
        let $table = $("#metadata-table tbody");
// prepend it if there is only 1
        if(this.csm_downloads.length == 1) {
          $table.prepend(tablePlaceholderRow);
        }
        $(`#metadata-table tbody tr[csm-metadata-gid='${gid}']`).remove();
    };

    var generateMetadataTableRow = function(layer) {
        let html = "";
        html += `<tr csm-metadata-gid="${layer.scec_properties.gid}">`;

        html += `<td>
<button class=\"btn btn-sm cxm-small-btn\" id=\"button_meta_${layer.scec_properties.gid}\" title=\"remove the region\" onclick=CSM.unselectRegion(\"${layer.scec_properties.gid}\") onmouseover=CSM.mouseoverRegion(${layer.scec_properties.gid}) onmouseout=CSM.mouseoutRegion(${layer.scec_properties.gid}) ><span id=\"csm_metadata_${layer.scec_properties.gid}\" class=\"glyphicon glyphicon-trash\"></span></button></td>`;
        html += `<td class="meta-data">${layer.scec_properties.gid}</td>`;
        html += `<td class="meta-data">${layer.scec_properties.dataset}</td>`;
        html += `<td class="meta-data">${layer.scec_properties.depth}</td>`;
        html += `<td class="meta-data">${layer.scec_properties.note} </td>`;
        html += `<td class="text-center"><button id=\"download_${layer.scec_properties.gid}\" class=\"btn btn-xs csm-btn\" onclick=\"CSM.downloadData(${layer.scec_properties.gid})\"><span class=\"glyphicon glyphicon-download\"></span></button></td>`;
        html += `</tr>`;
        return html;
    };


// remove from download list and also remove the rectangle layer
    this.removeFromDownloads = function(gid) {
      let len=this.csm_downloads.length;
      for(let i=0; i< len; i++) {
        let tmp=this.csm_downloads[i].scec_properties;
        if(tmp.gid == gid) {
          remove_bounding_rectangle_layer(gid);
          this.csm_downloads.splice(i,1);
          updateDownloadCounter(CSM.csm_downloads.length);
	  this.flyToDownloadBounds();
          return;
        }
      }
      window.console.log("BAD: removeFromDownloads");
    }

    this.highlight_metadata_row = function(gid) {
      let nm="button_meta_"+gid;
      var elt=document.getElementById(nm);
      if(elt) {
        elt.style.color="red";
      }
    };

    this.unhighlight_metadata_row = function(gid) {
      let nm="button_meta_"+gid;
      var elt=document.getElementById(nm);
      if(elt) {
        elt.style.color="black";
      }
    };

    // remove the entry
    this.unselectRegion = function(gid) {
       this.removeFromMetadataTable(gid);
       this.removeFromDownloads(gid); 
    };
    this.mouseoverRegion = function(gid) {
	highlight_bounding_rectangle_layer(gid);
	this.highlight_metadata_row(gid);
    };
    // mouseout the entry
    this.mouseoutRegion = function(gid) {
	unhighlight_bounding_rectangle_layer(gid);
	this.unhighlight_metadata_row(gid);
    };

    // clear all the rectangle regions from the map
    this.unselectAllRegion = function() {
      let len=this.csm_downloads.length;
      for(let i=0; i< len; i++) {
        let tmp=this.csm_downloads[i].scec_properties;
        this.removeFromMetadataTable(tmp.gid);
        remove_bounding_rectangle_layer(tmp.gid);
      }
      this.csm_downloads = [];
    }

    // clear the model layer from the map
    this.unselectAllModel = function() {
       pixiClearAllPixiOverlay();
       this.setupPixiSegment(0);
    }

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
                            onclick="CSM.downloadDataAll();" disabled>
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
          if( this.searchingType != this.searchType.model) return;
          this.unselectAllModel();
          $("#csm-model").hide();
        }

        this.resetLatlon = function () {
          if( this.searchingType != this.searchType.latlon) return;
          $("#csm-firstLatTxt").val("");
          $("#csm-firstLonTxt").val("");
          $("#csm-secondLatTxt").val("");
          $("#csm-scecondLonTxt").val("");
          skipRectangle();
	  this.unselectAllRegion();
          $("#csm-latlon").hide();
        }

/********************* csm INTERFACE function **************************/
       this.setupCSMInterface = function() {

            $("#csm-controlers-container").css('display','');
            $("div.mapData div.map-container").css('padding-left','30px');

            var $download_queue_table = $('#metadata-table');
            $download_queue_table.floatThead('destroy');
            this.replaceMetadataTable([]);
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
     
    // need to trigger csm-search-type change to none
    this.resetSearchType = function () {
window.console.log("resetSerchType");
       let elt=document.getElementById('csm-search-type');
       elt.value = "none";
       $("#csm-search-type").change();
    }

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
      let pixigid=CSM.csm_model_pixi_layers[midx][mmidx][didx];
      if(pixigid != undefined) {
//        window.console.log(" === FOUND an existing layer..");
        return pixigid;
        } else {
//          window.console.log(" === DID not Find an existing layer..");
          return null;
      }
    } 
    this.addModelLayers = function(midx,mmidx,didx,pixigid) {
//window.console.log(" ===> ADDING FOR", midx, mmidx, didx);
      let tmp=CSM.csm_model_pixi_layers[midx][mmidx][didx];
      if(tmp != undefined) {
        window.console.log(" === BAD BAD BAD - found  an existing layer..");
        } else {
          CSM.csm_model_pixi_layers[midx][mmidx][didx]=pixigid;
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
window.console.log("change ModelDepth with ..",v);
        this.current_modelDepth_idx=v; 
   };
   this.changeModelMetric = function(v) {
window.console.log("change ModelMetric with ..",v);
        this.current_modelMetric_idx=v; 
   };

/********************** zip utilities functions *************************/
    this.downloadDataAll = function() {
        window.console.log("downloadDataAll");
    };

    this.downloadData = function(gid) {
        let cnt=CSM.csm_downloads.length;
        for(let i=0; i<cnt; i++) {
          let timestamp=$.now();
          let tmp=CSM.csm_downloads[i];
          let tmp_gid=tmp.scec_properties.gid;

//XXX ???
//          let hdata=tmp.scec_properties.header;

          if(tmp_gid == gid) {
            let timestamp=$.now();
            let mlist = tmp.jblob;
            let data=getCSVFromMeta(mlist);
            saveAsCSVBlobFile(data, timestamp);
          }
        }
    };

    function getModelHeader(dataset) {
        let fname="dataset+"
        var hblob="";
    };

    function getCSVFromMeta(mlist) {
        let len=mlist.length;  // each data is a meta data format
        let last=len-1;

    // grab the first meta data and generate the title..
        let meta=mlist[0];
        let keys=Object.keys(meta);
        let jfirst=0;
        let jlen=keys.length;
        
   // skip gid and geom (key==0,45)
	if(keys[0] == "gid") { 
           jfirst=1;
           jlen=jlen-1;
        }
        if(keys[jlen] == "geom") {
           jlen=jlen-1;
        }

        var csvblob=csm_csv_keys[keys[jfirst]];
        for(let k=jfirst+1; k< jlen; k++) {
           csvblob += (','+csm_csv_keys[keys[k]]);
        }
        csvblob +='\n';

        for(let i=0; i< len; i++) {
            meta=mlist[i];
            var values=Object.values(meta)
            var vblob=JSON.stringify(values[jfirst]);
            for(let j=jfirst+1; j< jlen; j++) {
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
