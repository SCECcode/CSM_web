/***
   csm.js

   needs to track the 'depths' per models ??
   also need to track different models
***/

var CSM = new function () {

    this.model_debug = 0;
    this.model_initialized = false;
    // 
    // complete set of csm models info from the backend-service,
    // { "gid":gid, "model_name":mn, "table_name":tn, "jblob":jblob } 
    // and,
    //   jblob's format
    //   { "model": mn,
    //     "meta": { "dataCount": cnt, "dataByDEP": [ { "dep":d, "cnt":lcnt,  "aphi_max":max, "aphi_min":min}..] },
    //     "aphiRange": [mmax, mmin],
    //     "metric" : [ "shmax","aphi" ],
    //     "depths" : [ 1, 3, 5 ],
    //     "header" : "..." }
    // NEED to postprocess
    //           ##  Aphi ranges from 0 to 3
    //           ##  SHmax ranges from -90 to 90
    this.csm_models = [];

    //  track pixi gid for for each model metric for each depth, 
    //  made on-demand
    //  csm_model_pixi_layers['model_id]['metric_id']['depth_id']
    //  to avoid generate these repeatly
    this.csm_model_pixi_layers=[];

    //  track pixi's uid of current layer being looked at
    this.track_uid;  // unique id
    
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
        coordinates: [36.8, -120.0],
        zoom: 5.75 
    };

    this.searchType = {
        model: 'model',
        latlon: 'latlon'
    };
    this.searchingType=this.searchType.model;


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
    v3azi:'V3azi'
    };

    var tablePlaceholderRow = `<tr id="placeholder-row">
                        <td colspan="9">Metadata for selected region will appear here.</td>
                    </tr>`;

/********** show layer/select functions *********************/

// csm_meta_data is from viewer.php, which is the JSON 
// result from calling php getAllMetaData script
// hee hee.. use the reordering from CSM_tb 
//
    this.processModelMeta = function () {

        let base_models=CSM_tb['models'];
        let bsz=base_models.length;
        let blist=[];
        for(let i=0; i<bsz; i++) {
          let term=base_models[i];
          blist.push(term['name']);
        }
        let tmplist=[];
        for (const idx in csm_meta_data) {
          if (csm_meta_data.hasOwnProperty(idx)) {

            let tmp= csm_meta_data[idx];
            let tnm=tmp.model_name;
            let nidx=blist.indexOf(tnm);
            let bterm=base_models[nidx];
            let blabel=bterm.label;
            let jblob = JSON.parse(tmp.jblob);
            let term = {
                    idx:nidx,
                    gid: tmp.gid,
                    model_name: tmp.model_name,
                    table_name: tmp.table_name,
                    model_label: bterm.label,
		    skip: bterm.skip,
		    label_meta: bterm.label_meta,
		    data: bterm.data,
		    model_stress_type: bterm.stress_type,
                    jblob: jblob,
            };
            tmplist.push(term);
          }
        }
// might need to resort the list 
        let tsz=tmplist.length;
        let target=0;
        while(target < tsz) {
          for(let i=0; i<tsz; i++) {
            let term=tmplist[i];
            if(target == term.idx) {
              this.csm_models.push(term);
              target=target+1;
              break;
            }
          }
        }
        let slist=this.csm_models;
    };

/********** search/layer  functions *********************/
    this.showSearch = function (type) {

        this.searchingType = type;
        switch (type) {
            case this.searchType.model:
               $("#csm-model").show();
               $("#csm-latlon").hide();
               skipRectangle();
               break;
            case this.searchType.latlon:
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

        this.setupModelMetric(this.csm_models,0);
        this.setupModelDepth(this.csm_models,0);

        this.resetSearch();

        if ($("#cxm-model-csm-boreholes").prop('checked')) {
          document.getElementById("cxm-model-csm-boreholes").click();
        }

        if ($("#cxm-model-cfm").prop('checked')) {
          document.getElementById("cxm-model-cfm").click();
        }

        if ($("#cxm-model-gfm").prop('checked')) {
          document.getElementById("cxm-model-gfm").click();
        }

        // go back to default view,
        viewermap.setView(this.defaultMapView.coordinates, this.defaultMapView.zoom);
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

   // given a dataset's db_tb name, return whether it is a stress rate or stress model
   this.lookupModelStressType = function(tb_nm) {
        let sz=this.csm_models.length;
        for( let i=0; i<sz; i++) {
          let term=this.csm_models[i];
          if(term.table_name == tb_nm) { 
            return term.model_stress_type;
          }
        }
        return("bad model");
   };

	
// reset just the search only
    this.resetSearch = function (){
//window.console.log("calling --->> resetSearch.");

	pixiResetAllOverlayOpacity();
        pixiClearAllPixiOverlay();

        this.setupPixiSegmentDebug(0,{});
	this.unselectAllRegion();

        this.resetLatlon();

        $("#searchTypeModel").click(); // start with model option
        this.resetModel();
    };

    this.clearSearch = function (){
//window.console.log("calling --->> clearSearch.");
	pixiClearAllPixiOverlay();

        this.clearModel();
        this.clearLatlon();
    };

// check if the current combo model/metric/depth is valid
    this.checkSpec = function () {
        let tidx=parseInt($("#modelType").val());
        let model=this.csm_models[tidx];
        let tmodel=model['model_name'];
        let tmetric=$("#modelMetric").val();
        let tdepth=parseInt($("#modelDepth").val());

//window.console.log(">>>>>   LOOKING at ",tmodel, tmetric, tdepth);

        let dlist=model['jblob']['depth'];
        let mlist=model['jblob']['metric'];

        // first check if tmetric in the metric list
        let sz=mlist.length;
        for(let i=0; i<sz; i++) {
           if(mlist[i] == tmetric) {
	     // check if depth is in the depth list
             let ssz=dlist.length; 
             for(let j=0; j<ssz; j++) {
               if(dlist[j] == tdepth) {
//window.console.log("YOOHOO.. found it!!!");
                 return {"metric":i, "depth":j };
               }
             }
             return null;
           }
        }
        return null;
    };

// HOW TO DEFINE spec
// spec = [ tmodel, ddepth, mmetric ];
// spec_idx = [ tidx,midx,didx ];
// spec_data = [ data_min, data_max ]; a range specific to model and metric
    this.getSpec = function() {

      let tidx=parseInt($("#modelType").val());
      let model=this.csm_models[tidx];
      let tmodel=model['table_name'];

      if( (this.searchingType ==this.searchType.latlon) && 
        	          (model['data'] != undefined) ) { 
          tmodel=model['data'];
      }
         
      let d=model['jblob']['meta'];
      let dd=d['dataByDEP'];

      let tdepth=parseInt($("#modelDepth").val());
      let didx=0;
      for(let i=0; i<dd.length; i++) {
         let t=dd[i];
         if(t["dep"] == tdepth) {
           didx=i; 
           break;
         }
      }
      let ddd=dd[didx];
      let ddepth=ddd["dep"];
//window.console.log("SPEC:modelDepth_idx is "+didx+"("+ddepth+"km)");

      let m=model['jblob']['metric'];
      let tmetric=$("#modelMetric").val();
      let mdix=0;
      for(let i=0; i<m.length; i++) {
        if(m[i] == tmetric) {
          midx=i;
          break;
        }
      }
      let mmetric=m[midx];
//window.console.log("SPEC:modelMetric_idx is "+midx+"("+mmetric+")");

      let datamin=null;
      let datamax=null;
      // if metric is "aphi"
      if(mmetric=="Aphi") {	
        datamax=3.0;
        datamin=0.0;
      } else if(mmetric=="SHmax") {
        datamax=90.0;
        datamin=-90.0;
      } else if(mmetric=="Iso") {
        let keys=Object.keys(ddd);

        if( keys.indexOf('iso_001qs') >= 0 ) {
	  datamin=ddd['iso_001qs'];
	  datamax=ddd['iso_999qs'];
          } else {
	    datamin=ddd['iso_001q'];
	    datamax=ddd['iso_999q'];
        }
      } else if(mmetric=="Dif") {
        let keys=Object.keys(ddd);
        if( keys.indexOf('dif_001qs') >= 0 ) {
	  datamin=ddd['dif_001qs'];
	  datamax=ddd['dif_999qs'];
          } else {
	    datamin=ddd['dif_001q'];
	    datamax=ddd['dif_999q'];
        }
      }

// special case, if diplaying model data is different from download model data
      let spec = [ tmodel, ddepth, mmetric ];

      let spec_idx = [ tidx,midx,didx ];
      let spec_data = [datamin, datamax];

//window.console.log("using: spec is >> ",spec);
//window.console.log("spec_idx is: ",spec_idx);

      return [spec, spec_idx, spec_data];
    }


    this.changePixiLayerOpacity= function (alpha) {

      let spec = [];
      let spec_idx = [];
      let spec_data = [];
      [ spec, spec_idx, spec_data ] = this.getSpec();

      let pixiuid= this.lookupModelLayers(
                    spec_idx[0], spec_idx[1], spec_idx[2]);
      let old=pixiGetPixiOverlayOpacity(pixiuid);
      if(alpha != old) {
        pixiSetPixiOverlayOpacity(pixiuid, alpha);
      }
    }

    this.freshSearch = function (){

//window.console.log("calling, new freshSearch...");

     // retrieve model's database table name
     // depth value  
     // which metric type
         
      let spec = [];
      let spec_idx = [];
      let spec_data = [];
      [ spec, spec_idx, spec_data ] = this.getSpec();

// initiate search if it is for whole model or
// wait for a region 

      if(this.searchingType == this.searchType.model) {
//window.console.log("in freshSearch --model");
        pixiClearAllPixiOverlay();
        CSM.setupPixiSegmentDebug(0,{});

        var pixiuid= CSM.lookupModelLayers(
                       spec_idx[0], spec_idx[1], spec_idx[2]);

        if(pixiuid != null) { // reuse and add to viewer map 
          pixiShowPixiOverlay(pixiuid);
          let seginfo=pixiFindSegmentProperties(pixiuid);
          CSM.setupPixiSegmentDebug(pixiuid,seginfo);
          CSM.setupPixiLegend(pixiuid,spec,seginfo);
          let opacity=pixiGetPixiOverlayOpacity(pixiuid);
          setOpacitySliderHandle(opacity);		   
          } else {
            pixiuid = this.search(this.searchType.model, spec, spec_idx, spec_data);
        }

        return;
      }

      if(this.searchingType == this.searchType.latlon) {
//window.console.log("in freshSearch --latlon");

// in freshSearch/latlon, might need to clear the map");
        pixiClearAllPixiOverlay();
        CSM.setupPixiSegmentDebug(0,{});

        var pixiuid= CSM.lookupModelLayers(
                       spec_idx[0], spec_idx[1], spec_idx[2]);

        if(pixiuid != null) { // reuse and add to viewer map 
          pixiShowPixiOverlay(pixiuid);
          let seginfo=pixiFindSegmentProperties(pixiuid);
          CSM.setupPixiSegmentDebug(pixiuid,seginfo);
          CSM.setupPixiLegend(pixiuid,spec,seginfo);
          let opacity=pixiGetPixiOverlayOpacity(pixiuid);
          setOpacitySliderHandle(opacity);		   
          } else {
            pixiuid = this.search(this.searchType.model, spec, spec_idx, spec_data);
        }
        // go to original zoom/map
        viewermap.setView(this.defaultMapView.coordinates, this.defaultMapView.zoom);

// then call latlon search..
        this.searchLatlon(0, []);
      }
    };

// a layer is always generated with the full set of legend bins
   function _legendoptionChecked(label,pixiuid,idx,color,check) {
     var html="<li>";
     if(check) {
       html=html+ "<input type=\"checkbox\" class='legend-label mr-1' title=\"toggle the region\" id=\"pixiLegend_"+idx+"\" onclick=CSM.togglePixiLegend(\""+pixiuid+"\","+idx+",\"pixiLegend_"+idx+"\") style=\"accent-color:"+color+"\" checked >";
       } else {
         html=html+ "<input type=\"checkbox\" class='legend-label mr-1' title=\"toggle the region\" id=\"pixiLegend_"+idx+"\" onclick=CSM.togglePixiLegend(\""+pixiuid+"\","+idx+",\"pixiLegend_"+idx+"\") style=\"accent-color:"+color+"\" >";
     }
     html=html+"<label for=\"pixiLegend_"+idx+"\"><span>"+label+"</span></label></li>";
     return html;
    }

// a layer is always generated with the full set of legend bins
   function _legendoptioncolor(color) {
     var html="<li><span class=\"color\" style=\"background-color: "+color+"\"></span></li>";
     return html;
    }
// a layer is always generated with the full set of legend bins
   function _legendoptionlabel(label) {
     var html="<li><label class=\"legend-label\"><span>"+label+"</span></label></li>";
     return html;
    }

    this.setupPixiLegend = function(pixiuid, spec,legendinfo) {
      if(jQuery.isEmptyObject(legendinfo)) {
        $("#pixi-legend").html("");
        return;
      }

      let namelist=legendinfo['names'];
      let lengthlist=legendinfo['counts'];
      let labellist=legendinfo['labels']; // label includes the last extra one
      let colorlist=legendinfo['colors'];
      let checklist=legendinfo['checks'];
      let n=namelist.length;
      let chtml = "";
      let lhtml = "";
      // include the top 'invisible' one
      for(let i=0; i<n; i++) {
         let name=namelist[i];
         let color=colorlist[i];
         let label=labellist[i]; // segment's label 
         let length=lengthlist[i];
         let check=checklist[i];
         if(length == 0) {
	    check=0;
         }
         if(i== Math.floor(n/2)) {
	   chtml=_legendoptioncolor(color, 1)+chtml;
           } else {
	     chtml=_legendoptioncolor(color, 0)+chtml;
         }
         lhtml=_legendoptionlabel(label)+lhtml;
      }
      // include the top 'invisible' one
      lhtml=_legendoptionlabel(labellist[n])+lhtml;

      chtml="<ul>"+chtml+"</ul>";
      $("#pixi-legend-color").html(chtml);

      lhtml="<ul>"+lhtml+"</ul>";
      $("#pixi-legend-label").html(lhtml);


      // update the title to pixi legend,
      let metric=spec[2];
      if(metric == "SHmax") {
        $("#pixi-legend-title").html("Degrees");
        } else if (metric == "Aphi") {
          $("#pixi-legend-title").html("Aphi");
        } else {
           let tbname=spec[0];
           let stype=this.lookupModelStressType(tbname);
           if(stype == 0) { // stress
             $("#pixi-legend-title").html("MPa");
             } else { // stress rate
               $("#pixi-legend-title").html("MPa/yr");
           }
      }
    };

    this.togglePixiLegend = function(pixiuid, n, label) {
//window.console.log("calling togglePixiLegend.. with ",n,"on pixiuid ",pixiuid);
      let vis=pixiToggleParticleContainer(pixiuid,n);
    };

// a layer is always generated with the full set of segments 
// so pop up the pixi segment selector on dashboard
// max n would be 20
   function _segmentoption(label,pixiuid,idx,color,check) {
     var html="";
     if(check) {
       html=html+ "<input type=\"checkbox\" class='checkboxk-group mr-1' id=\"pixiSegment_"+idx+"\" onclick=CSM.togglePixiSegment(\""+pixiuid+"\","+idx+") style=\"accent-color:"+color+"\" checked >";
       } else {
         html=html+ "<input type=\"checkbox\" class='checkboxk-group mr-1' id=\"pixiSegment_"+idx+"\" onclick=CSM.togglePixiSegment(\""+pixiuid+"\","+idx+") style=\"accent-color:"+color+"\" >";
     }
     html=html+"<label class='checkbox-group-label mr-2' for=\"pixiSegment_"+idx+"\"><span>"+label+"</span></label>";
      return html;
    }

    //seginfo is { names: nlist, counts:clist, labels:llist };
    this.setupPixiSegmentDebug = function(pixiuid,seginfo) {

      if(!this.model_debug) return;

//window.console.log("setupPixiSegmentDebug...",pixiuid);
      if(jQuery.isEmptyObject(seginfo)) {
        $("#pixi-segment").html("");
        return;
      }

      let namelist=seginfo['names'];
      let lengthlist=seginfo['counts'];
      let labellist=seginfo['labels'];
      let colorlist=seginfo['colors'];
      let checklist=seginfo['checks'];
      let n=namelist.length;
      let html = "";
      for(let i=0; i<n; i++) {
         let name=namelist[i];
         let color=colorlist[i];
         let label=labellist[i]; // segment's label 
         let length=lengthlist[i];
         let check=checklist[i];
         if(length == 0) {
	    check=0;
         }
         let v=i+1;
         let foo=label+"&nbsp;&nbsp;&nbsp;(n="+length+")";
	 html=_segmentoption(foo,pixiuid,i,color,check)+"<br>"+html;
      }
      $("#pixi-segment").html(html);
    }

    this.togglePixiSegment = function(pixiuid, n) {
window.console.log("calling togglePixiSegment.. with ",n,"on pixiuid ",pixiuid);
      let vis=pixiToggleParticleContainer(pixiuid,n);
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
    //
    // special case, if a model has a 'actual' data tb that needs to
    // be searched instead of the one showing on the viewer, then needs 
    // to swap out the 'dataset' field ie. LongValley when searching for latlon
    //
    this.search = function(type, spec, criteria, spec_data) {

        CSM.startWaitSpin();

        let tmp=criteria;
        if(type==CSM.searchType.model) { tmp = []; }
        if (!Array.isArray(tmp)) { tmp = [tmp]; }

        let JSON_criteria = JSON.stringify(tmp);

        let JSON_spec = JSON.stringify(spec);

        let dataset=this.lookupDataset(spec[0]);

//window.console.log(" ===> dataset used for search..", dataset);
//window.console.log(" ===> spec used..", spec);

        $.ajax({
            url: "php/search.php",
            data: {t: type, s: JSON_spec, q: JSON_criteria},
        }).done(function(search_result) {
            let latlist;
            let lonlist;
            let vallist;
            if(search_result === "[]") {
                notify(" No data in the marked area!! ");
                //alert(" No data in the marked area!! "); 
                CSM.removeWaitSpin();
// remove all the rectangle drawn on the map 
		remove_all_bounding_rectangle_layer();
            } else {
                if(type==CSM.searchType.model) { 
                    let tmp=JSON.parse(search_result); 
                    latlist=tmp['lat'];
                    lonlist=tmp['lon'];
                    vallist=tmp['val'];

                    pixiClearAllPixiOverlay();
                    CSM.setupPixiSegmentDebug(0,{});

/*  pixi_spec:
       seg_cnt  sets  DATA_SEGMENT_COUNT
       data_max sets  DATA_MAX_V
       data_min sets  DATA_MIN_V
*/
//window.console.log("SEARCH :",criteria);
//window.console.log("SEARCH :",spec);


                    let pixi_spec = { 'seg_cnt' : 12};
                    pixi_spec.rgb_set=2;
                    
                    if(spec_data[0] != null && spec_data[1] != null) {
                      pixi_spec.data_min=spec_data[0];
                      pixi_spec.data_max=spec_data[1];
                    }

//window.console.log("SEARCHING for ",spec[2]);
                    // if metric is "aphi"
                    if(spec[2]=="Aphi") {	
                       pixi_spec.rgb_set=1;
                    }
                    if(spec[2]=="SHmax") {
                       pixi_spec.rgb_set=0;
                    }

                    // 2km grid or 5km grid  
                    pixi_spec.scale_hint=2;
                    if(spec[1] >= 50) {
                      pixi_spec.scale_hint=5;
                    }

//pixiOverlayList.push({"gid":gid,"vis":1,"overlay":overlay,"top":pixiContainer,"inner":pContainers,"latlnglist":pixiLatlngList});
// returning overlay
	            CSM.track_uid=getRnd("csm");
                    var pixiuid=makePixiOverlayLayerWithList(
                             CSM.track_uid,
                             latlist,lonlist,vallist,pixi_spec);
                    CSM.removeWaitSpin();

                    CSM.addModelLayers(criteria[0],criteria[1],criteria[2],pixiuid);

                    // need to get segment information from csm_pixi.js
                    let seginfo=pixiFindSegmentProperties(pixiuid);
                    CSM.setupPixiSegmentDebug(pixiuid,seginfo);
                    CSM.setupPixiLegend(pixiuid,spec,seginfo);
                    let opacity=pixiGetPixiOverlayOpacity(pixiuid);
                    setOpacitySliderHandle(opacity);		   

                    return pixiuid;
                }
                if(type==CSM.searchType.latlon) { 
                    let jblob=JSON.parse(search_result); 
                    let sz=jblob.length;
                    if(sz > 0) { 
                      let first = jblob[0];
                      let scec_properties={};
                      let gid = get_bounding_rectangle_layer_gid();
                      scec_properties.gid=gid; 
                      scec_properties.depth=first.dep;
                      scec_properties.metric= spec[2];
                      scec_properties.lon1=criteria[0];
                      scec_properties.lat1=criteria[1];
                      scec_properties.lon2=criteria[2];
                      scec_properties.lat2=criteria[3];
                      scec_properties.dataset=dataset;
                      scec_properties.note=sz;
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

    // make sure the displayed background is correct,
    this._redrawModel = function() {
//window.console.log("calling redrawModel..");

        if( this.model_initialized == false ) return;     

	let spec = [];
        let spec_idx = [];
        let spec_data = [];
        [ spec, spec_idx, spec_data ] = this.getSpec();

        // make sure the displayed background is correct,
        var pixiuid= CSM.lookupModelLayers(
                       spec_idx[0], spec_idx[1], spec_idx[2]);

        if(pixiuid != null) { // reuse and add to viewer map
          pixiShowPixiOverlay(pixiuid);
          let seginfo=pixiFindSegmentProperties(pixiuid);
          CSM.setupPixiSegmentDebug(pixiuid,seginfo);
          CSM.setupPixiLegend(pixiuid,spec, seginfo);
          let opacity=pixiGetPixiOverlayOpacity(pixiuid);
          setOpacitySliderHandle(opacity);		   
          } else {
            pixiuid = this.search(this.searchType.model, spec, spec_idx, spec_data);
        }
    };
	     
    // special case, Latlon can be from text inputs or from the map
    // fromWhere=0 is from text
    // fromWhere=1 from drawRectangle call
    this.searchLatlon = function (fromWhere, rect) {
//window.console.log("calling searchLatlon..");
        let criteria = [];

        let spec = [];
        let spec_idx = [];
        let spec_data = [];
        [ spec, spec_idx, spec_data ] = this.getSpec();

        if( fromWhere == 0) {

            let lat1=parseFloat($("#csm-firstLatTxt").val());
            let lon1=parseFloat($("#csm-firstLonTxt").val());
            let lat2=parseFloat($("#csm-secondLatTxt").val());
            let lon2=parseFloat($("#csm-secondLonTxt").val());

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

		    //display to 5 decimal 
                $("#csm-firstLatTxt").val( parseFloat((criteria[0]).toFixed(5)));
                $("#csm-firstLonTxt").val( parseFloat((criteria[1]).toFixed(5)));
                $("#csm-secondLatTxt").val( parseFloat((criteria[2]).toFixed(5)));
                $("#csm-secondLonTxt").val( parseFloat((criteria[3]).toFixed(5)));
        }

        // not expecting anything 
        let ret= this.search(CSM.searchType.latlon, spec, criteria, spec_data);

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
        html += `<td class="meta-data">All</td>`;
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
      updateDownloadCounter(CSM.csm_downloads.length);
    }

    // clear the model layer from the map
    this.unselectAllModel = function() {
       pixiClearAllPixiOverlay();
       this.setupPixiSegmentDebug(0,{});
    }

    var generateMetadataTable = function (results) {
//window.console.log("generateMetadataTable..");
            var html = "";
            html+=`
<thead>
<tr>
        <th class="text-center button-container" style="width:2rem">
        </th>
        <th class="hoverColor" style="width:10rem" >Id&nbsp<span></span></th>
        <th class="hoverColor" style="width:15rem" onClick="sortMetadataTableByRow(2,'a')">Model&nbsp<span id='sortCol_2' class="fas fa-angle-down"></span></th>
        <th class="hoverColor">Metric</span></th>
        <th class="hoverColor" onClick="sortMetadataTableByRow(4,'n')">Depth (km)<span id='sortCol_4' class="fas fa-angle-down"></span></th>
        <th class="hoverColor">Num Data Points</th>
        <th style="width:0%;"><div class="col text-center">Downloads<span id="download-counter"></div>
<!--download all
                <div class="btn-group download-now">
                    <button id="download-all" type="button" class="btn btn-dark" value="metadata"
                            onclick="CSM.downloadDataAll();" disabled>
                            DOWNLOAD&nbsp<span id="download-counter"></span>
                    </button>
                </div>
-->
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

        this.clearModel = function () {
          if( this.searchingType != this.searchType.model) return;
          pixiClearAllPixiOverlay();
          this.setupPixiSegmentDebug(0,{});
        }

        this.resetModel = function () {
          if( this.searchingType != this.searchType.model) return;
	  this.resetModelType();
        }

        this.clearLatlon = function () {
          if( this.searchingType != this.searchType.latlon) return;
          $("#csm-firstLatTxt").val("");
          $("#csm-firstLonTxt").val("");
          $("#csm-secondLatTxt").val("");
          $("#csm-secondLonTxt").val("");
          skipRectangle();
	  this.unselectAllRegion();
        }

        this.resetLatlon = function () {
          if( this.searchingType != this.searchType.latlon) return;
          $("#csm-firstLatTxt").val("");
          $("#csm-firstLonTxt").val("");
          $("#csm-secondLatTxt").val("");
          $("#csm-secondLonTxt").val("");
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
		    skip:undefined,
		    label_meta:undefined,
                    jblob: jblob,
              */
               if(term.skip != undefined) {
                 window.console.log("skipping this one..", term.model_label);
	         continue;	     
               }
               
               var elt=document.getElementById('modelType');
               let option = document.createElement("option");
               option.text = term.model_name;
               option.label = term.model_label;
               option.value= term.idx;
               elt.add(option);
            }

            let mblob=CSM_tb['metrics'];
            var melt=document.getElementById('modelMetric');
	    let msz=mblob.length;
	    for(let i=0; i<msz; i++) {
               let mterm=mblob[i]; 
               let mlabel=mterm['label'];
               let mname=mterm['name'];
               let mid="csmmetric_"+mname;
               let option = document.createElement("option");
               option.id=mid;
               option.value=mname;
               option.label = mlabel;
               melt.add(option);
            }

/* create the default model depth list to 1st one for model */
            this.setupModelMetric(this.csm_models,0);
            this.setupModelDepth(this.csm_models,0);

            this.setupModelLayers(this.csm_models);

            this.model_initialized=true;

            $("#searchTypeModel").click(); // start with model option
            this.resetModel(); // set to the first one
	    retreiveBoreholes();
            let alpha=0.8;
	    setupOpacitySlider(alpha);
    };
     
    // need to trigger modelType change to first model
    // metric and depth are using what is there..
    this.resetModelType = function () {
       let elt=document.getElementById('modelType');
       elt.value = 0;
       $("#modelType").change();
    }

    this.refreshModelDescription = function (target){
       let target_name=CSM.csm_models[target].model_name;
       let mlist=CSM_tb['models'];
       let sz=mlist.length;
       for(let i=0; i<sz; i++) {
         let term=mlist[i];
         if(term['name'] == target_name) {
           let descript=term['description'];
           $("#csm-model-description").html(descript);
           if( "modelinfo" in term ) {
             let modelinfo=term['modelinfo'];
               $("#model-info-popup").html(modelinfo);
             // enable button 
           }
           break;
         }
       }
    }

    // mlist,
    // { "gid":gid, "model_name":mn, "table_name":tn, "jblob":jblob }
    // and,
    //   jblob's format
    //   { "model": mn,
    //     "meta": { "dataCount": cnt, "dataByDEP": [ { "dep":d, "cnt":lcnt,  "aphi_max":max, "aphi_min":min}..] },
    //     "aphiRange": [mmax, mmin],
    //     "metric" : [ "aphi" ] }
    //     "depth" : [ d ] }
  
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
      let pixiuid=CSM.csm_model_pixi_layers[midx][mmidx][didx];
      if(pixiuid != undefined) {
//        window.console.log(" === FOUND an existing layer..");
        return pixiuid;
        } else {
//          window.console.log(" === DID not Find an existing layer..");
          return null;
      }
    } 
    this.addModelLayers = function(midx,mmidx,didx,pixiuid) {
//window.console.log(" ===> ADDING FOR", midx, mmidx, didx);
      let tmp=CSM.csm_model_pixi_layers[midx][mmidx][didx];
      if(tmp != undefined) {
        window.console.log(" === BAD BAD BAD - found  an existing layer..");
        } else {
          CSM.csm_model_pixi_layers[midx][mmidx][didx]=pixiuid;
      }
    };

// option disabled all first and the activate just 1.
    this.setupModelMetric = function (mlist,model_idx,target=0) {
      //preset all option to disable	     
      $("select[id='modelMetric'] option").attr('disabled', true);

      let dlist=mlist[model_idx]['jblob']['metric'];
      let sz=dlist.length;
      for(let i=0;i<sz;i++) {
         let n='csmmetric_'+dlist[i];
         $("select option[id='"+n+"']").attr('disabled', false);
      }
      let first='csmmetric_'+dlist[target];
      let elt=document.getElementById(first);
      let val=elt.value;
      let select=document.querySelector("#modelMetric");
      select.value=val;
      // preset to first one
      this.refreshMetricDescription(val);
    };

    // set to first metric
    this.resetModelMetric = function (mlist,model_idx) {
      let dlist=mlist[model_idx]['jblob']['metric'];
      let first='csmmetric_'+dlist[0];
      let elt=document.getElementById(first);
      let val=elt.value;
      let select=document.querySelector("#modelMetric");
      select.value=val;
      // to first one
      this.refreshMetricDescription(0);
    };

    this.refreshMetricDescription = function (target) {
       let mlist=CSM_tb['metrics'];
       let sz=mlist.length;
       for(let i=0; i<sz; i++) {
         let term=mlist[i];
         if(term['name'] == target) {
           let descript=term['description'];
           $("#csm-metric-description").html(descript);
           break;
         }
       }
    }

// option disabled all.
    this.setupModelDepth = function (mlist,model_idx,target=0) {
      //preset all option to disable
      $("select[id='modelDepth'] option").attr('disabled', true);

      let dlist=mlist[model_idx]['jblob']['depth'];
      let sz=dlist.length;
      for(let i=0;i<sz;i++) {
         let n='csmdepth_'+dlist[i];
         $("select option[id='"+n+"']").attr('disabled', false);
      }
      let first='csmdepth_'+dlist[target];
      let elt=document.getElementById(first);
      let val=elt.value;
      let select=document.querySelector("#modelDepth");
      select.value=val;
    };

    // set to first metric
    this.resetModelDepth = function (mlist,model_idx) {
      let dlist=mlist[model_idx]['jblob']['depth'];
      let first='csmdepth_'+dlist[0];
      let elt=document.getElementById(first);
      let val=elt.value;
      let select=document.querySelector("#modelDepth");
      select.value=val;
    };


   this.changeModelDepth = function(v) {
//window.console.log("change ModelDepth with ..",v);
        this._redrawModel();
        //special case, if in 'select region' mode, trigger a selection
        if(this.searchingType == this.searchType.latlon) {
          $("#searchAgain").click();
        }
   };
   this.changeModelMetric = function(v) {
//window.console.log("change ModelMetric with ..",v);
        this.refreshMetricDescription(v);
        this._redrawModel();
   };

    this.changeModelModel = function (mlist,v) {
	this.refreshModelDescription(v);

        let orig=this.checkSpec();

        if(this.searchingType == this.searchType.model) {
          if(orig != null) { 
	    this.setupModelMetric(mlist,v,orig['metric']);
	    this.setupModelDepth(mlist,v,orig['depth']);
            } else { //go to default
	      this.setupModelMetric(mlist,v,0);
              this.setupModelDepth(mlist,v,0);
              viewermap.setView(this.defaultMapView.coordinates, this.defaultMapView.zoom);
              notify("Switching to a different metric/depth for this model.");
          }
          this.freshSearch();
        }

        if(this.searchingType == this.searchType.latlon) {
          if(orig != null) { /* grab current metric and and depth */
	    this.setupModelMetric(mlist,v,orig['metric']);
	    this.setupModelDepth(mlist,v,orig['depth']);
            this.freshSearch();
            //$("#searchAgain").click();
            } else { // go to default
	      this.setupModelMetric(mlist,v,0);
              this.setupModelDepth(mlist,v,0);
              this._redrawModel();
              viewermap.setView(this.defaultMapView.coordinates, this.defaultMapView.zoom);
              notify("No valid data found in this region and depth for the selected model. Please try another region or model.");
          }
        }
    }

/********************** zip utilities functions *************************/
    this.downloadDataAll = function() {
        window.console.log("downloadDataAll");
    };

    this.downloadData = function(gid) {
        let cnt=CSM.csm_downloads.length;
        for(let i=0; i<cnt; i++) {
          let tmp=CSM.csm_downloads[i];
          let tmp_gid=tmp.scec_properties.gid;
          if(tmp_gid == gid) {
            let mlist = tmp.jblob;
            let hdata=getModelHeader(tmp.scec_properties.dataset);
//window.console.log("-- header file..", tmp.scec_properties.dataset);
            let data="";
            if(hdata != "") {
              data=getCSVFromMeta(0,mlist);
              } else {
                data=getCSVFromMeta(1,mlist);
            }
            _saveAsCSVBlobFile(hdata+data, gid);
          }
        }
    };

    function _saveAsJSONBlobFile(data, timestamp) {
        saveAsJSONBlobFile("CSM_data_", data, timestamp);
    }

    function _saveAsCSVBlobFile(data, timestamp) {
        saveAsCSVBlobFile("CSM_data_", data, timestamp);
    }

    function _saveAsBlobFile(data) {
        saveAsBlobFile("CSM_link_",data);
    }

    function getModelHeader(dataset) {
        let url="./csm_data/"+dataset+".csv_header";
        var hdrblob=ckExist(url);
        return hdrblob;
    };

    function getCSVFromMeta(needtitle,mlist) {
        let len=mlist.length;  // each data is a meta data format
        let last=len-1;
        var csvblob="";

// grab the first meta data and generate the title..
        let meta=mlist[0];
        let keys=Object.keys(meta);
        let jfirst=0;
        let jlen=keys.length;
        
   // skip gid and geom (key==0,45)
	if(keys[0] == "gid") { 
           jfirst=1;
        }
        if(keys[jlen-1] == "geom") {
           jlen=jlen-1;
        }
  

        if(needtitle) {
// grab the first meta data and generate the title..
          csvblob=csm_csv_keys[keys[jfirst]];
          for(let k=jfirst+1; k< jlen; k++) {
             csvblob += (','+csm_csv_keys[keys[k]]);
          }
          csvblob +='\n';
        }
  
// grab rest of the data
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
