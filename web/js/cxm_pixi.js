/***
   cxm_pixi.js

***/

/***

  { "visible":true,
    "overlay":overlay,
    "top":pixiContainer,
    "active_uid":aUid,
    "active_opacity":aOpacity,
    "groups": [{"uid":uid,"visible":1, "segments": segments, opacity:opacity,inner:pContainers},...]}

 JUST one master pixi overlay for CSM,  with groups of pContainers -- 
    one(group/layer)  per uid/model-metric-depth
 pContainers = [ one pContainer per chunking segments ]

 for each group,  all data are put in this structure with 12 chunks/segments
     pixiLatlngList= {"uid":uid,"data":datalist} 
       (array of arrays)
       datalist[ [{'lat':v,'lon':vv}...], [{...}], ... ]

 segments track number of data per segment/chunk
       [ len1, len2 .. ]

***/
var PIXI_pixiOverlayList=[];

/* How many segments to chunk a set of data */
var PIXI_DEFAULT_DATA_SEGMENT_COUNT=undefined;

var PIXI_DEFAULT_OPACITY=0.8;


var DATA_SEGMENT_COUNT=undefined; // chunking supplied from client 
var DATA_MAX_V=undefined;
var DATA_MIN_V=undefined;
var DATA_count=0;

var pixi_cmap_tb=undefined;

/* expose pixiOverlay's util to global scope */
var pixi_project=null;

/* textures in a marker containeri */
var markerTexturesPtr=null;

var loadOnce=1;


/*************************************************************************/
/** debug for seeing where canvas context were called

HTMLCanvasElement.prototype.getContext = function(origFn) {
  return function(type, attribs) {
          window.console.log("    ----Calling new getContext,", Context_count);
    Context_count++;
    attribs = attribs || {};
//    attribs.preserveDrawingBuffer = true;
    return origFn.call(this, type, attribs);
  };
}(HTMLCanvasElement.prototype.getContext);
**/

/*************************************************************************/
// print each segment's count and whole set's count
function printMarkerLatlngInfo(plist) {
  let sum=0;
  window.console.log("PIXI: For: "+plist.uid);
  for(let i=0; i<DATA_SEGMENT_COUNT; i++) {
    let dlist=plist[i];
    sum=sum+data.length;
    window.console.log("PIXI:    i: "+i+" count: "+ dlist.length);
  }
  window.console.log("PIXI:  sum up :"+sum);
}

function addMarkerLatlng(plist,idx,lat,lng) {
  let dlist=plist[idx];
  dlist.push({'lat':lat,"lng":lng});
}

function getMarkerCount(latlonlist,idx) {
  let dlist=latlonlist.data[idx];
  let sz=dlist.length;
  return sz;
}

function getMarkerLatlngs(latlonlist,idx) {
  let dlist=latlonlist.data[idx];
  return dlist;
}

/*************************************************************************/
function pixiGetSegmentRangeIdx(vs_target, N, vs_max, vs_min) {
  if(vs_target <= vs_min) {
    return 0;  
  }
  if(vs_target >= vs_max) {
    return N-1;
  }
  var step = (vs_max - vs_min)/N;
  var offset= Math.floor((vs_target-vs_min)/step);
  return offset;
}

function pixiFindSegmentProperties(uid) {
  let rlist={};
  let namelist=[];
  let colorlist=[];
  let labellist=[];
  let lengthlist=[];
  let checklist=[];
  let ret=pixiFindPixiWithUid(uid);

  if(ret != null) {
    let pixi=ret.pixi;
    let clist=pixi.inner;
    let sz=clist.length;

    for(let i=0; i<sz; i++) {
      let citem=clist[i];
      let term=citem.csm_properties;
      namelist.push(term.segment_name);
      lengthlist.push(term.segment_cnt);
      labellist.push(term.segment_label);
      colorlist.push(term.segment_color);
      if(citem.visible) {
        checklist.push(1);
        } else {
          checklist.push(0);
      }
    }
    // put in the end label of the last term
    let term=clist[sz-1].csm_properties;
    labellist.push(term.segment_label_end);
    
    rlist={ names: namelist, 
         counts:lengthlist,
         labels:labellist,
         colors:colorlist,
         checks:checklist};
  }
  return rlist;
}


// create a list of N values for creating legend labels
function pixiGetSegmentRangeList(N, vs_max, vs_min) {
  var step = (vs_max - vs_min)/N;
  var mult=10;
  let abs_step=Math.abs(step);
  let abs_vs_min=Math.abs(vs_min);

  if (abs_step < 0.00001 || (abs_vs_min < 0.00009 && abs_vs_min!=0)) {
    mult=1000000; 
  } else if (abs_step < 0.0001 || (abs_vs_min < 0.0009 && abs_vs_min!=0))  {
    mult=100000;
  } else if (abs_step < 0.001 || (abs_vs_min < 0.009 && abs_vs_min!=0))  { 
    mult=10000;
  } else if (abs_step < 0.01 || (abs_vs_min < 0.09 && abs_vs_min!=0))  { 
    mult=1000;
  } else if (abs_step < 0.1 || (abs_vs_min < 0.9 && abs_vs_min!=0))  { 
    mult=100;
  }
//window.console.log( "  ---> STEP is ", abs_step);
//window.console.log( "  ---> vs_min is ", abs_vs_min);
//window.console.log( "  ---> USING MULTI is ", mult);
  let digits=0;

  let tlist= [];
  for(let i=0; i<N; i++) {
    let v= (Math.floor((vs_min + (step * i ))*mult)/mult);
    let parts=String(v).split('.');
    if(parts[1] != undefined) {
      let t=parts[1].length;
      if(t>digits) {
        digits=t;
      }
    }
    tlist.push(v);
  }

  var slist=[];
  for(let j=0; j<N; j++) {
    slist.push(tlist[j].toFixed(digits));
  }

// including the last one
  slist.push( (Math.floor(vs_max*mult)/mult).toFixed(digits));
  return slist;
}

// from pixi,
//  >> Adds a BaseTexture to the global BaseTextureCache. This cache is shared across the whole PIXI object.
// PIXI.BaseTexture.addToCache (baseTexture, id)
// PIXI.BaseTexture.from (source, options, strict) PIXI.BaseTexture static
//

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillRect
function pixiCreateBaseTexture(color,name) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 14, 14);

  let texture=PIXI.Texture.from(canvas);
  PIXI.BaseTexture.addToCache(texture,name);
  return texture;
}

/*************************************************************************/
/*************************************************************************/
function init_pixi(loader) {
  PIXI_pixiOverlayList=[];
  csm_init_pixi();
}

function setup_pixi() {
  if(loadOnce) {
    init_pixi();
    loadOnce=0;
  }
}

// order everything into a sorted array
// break up data into buckets (one per segment)
// input : latlist, lonlist, vallist
// returns :
//    {"uid":uid,"data":[ [{"lat":lat,"lng":lng},...], ...] }
function _loadup_data_list(uid,latlist,lonlist,vallist) {

   let data_max_v=null;
   let data_min_v=null;
   DATA_count=0;

   let rawlist=[];
   let pixiLatlngList;
   let datalist=[];
   
   for(var i=0; i<DATA_SEGMENT_COUNT; i++) {
      datalist.push([]);
   }

   let sz=latlist.length;

   for(let i=0; i<sz; i++) {
      let lon=parseFloat(lonlist[i]);
      let lat=parseFloat(latlist[i]);
      let val=parseFloat(vallist[i]);
      if(Number.isNaN(val) || val == "nan") {
          continue;
      }
      rawlist.push([val,lat,lon]);

      if(data_max_v == null) {
          data_max_v = val;
          data_min_v = val;  
          } else {
              if(val > data_max_v) {
                data_max_v=val;
              }
              if(val < data_min_v) {
                data_min_v=val;
              }
      }
   }
   if(DATA_MAX_V == undefined) {
     DATA_MAX_V = data_max_v;
   }
   if(DATA_MIN_V == undefined) {
     DATA_MIN_V = data_min_v;
   }

   // sort datalist
   let sorted_rawlist = rawlist.sort((a,b) => {
          return b[0] - a[0];
   });
   let sorted_vlist=sorted_rawlist.map(function(value,index){ return value[0]; });

   DATA_count=sorted_rawlist.length;
   for(let i=0; i<DATA_count; i++ ) {
      let item=sorted_rawlist[i];
      let lon=item[2];
      let lat=item[1];
      let val=item[0];
      let idx=pixiGetSegmentRangeIdx(val, DATA_SEGMENT_COUNT, DATA_MAX_V, DATA_MIN_V);
      addMarkerLatlng(datalist,idx,lat,lon);
   }
   pixiLatlngList= {"uid":uid,"data":datalist} ; 

   return pixiLatlngList;
}

// this is for CSM
function makePixiOverlayLayerWithList(uid,latlist,lonlist,vallist,spec) {
    var pixiLatlngList;

    if(spec.seg_cnt!=0) { 
      DATA_SEGMENT_COUNT = spec.seg_cnt;
      } else {
        DATA_SEGMENT_COUNT = PIXI_DEFAULT_DATA_SEGMENT_COUNT;
    }
    if(spec.data_max != undefined) { 
      DATA_MAX_V = spec.data_max;
      } else {
        DATA_MAX_V = undefined;
    }
    if(spec.data_min != undefined) { 
      DATA_MIN_V = spec.data_min;
      } else {
        DATA_MIN_V = undefined;
    }

    pixiLatlngList=_loadup_data_list(uid,latlist,lonlist,vallist);

//window.console.log("PIXI:SEG_COUNT " + DATA_SEGMENT_COUNT);
//window.console.log("PIXI:DATA_MAX " + DATA_MAX_V);
//window.console.log("PIXI:DATA_MIN " + DATA_MIN_V);

    return makePixiOverlayLayer(uid,pixiLatlngList,spec);
}


/*************************************************************************/
/**
  MAIN creation routine

  spec = {'data_max':3.0, 'data_min':1.0, 'seg_cnt':12};
  data_max and data_min is client specified limits

  for each group,  all data are put in this structure with 12 chunks/segments
     pixiLatlngList= {"uid":uid,"data":datalist}
       (array of arrays)
       datalist[ [{'lat':v,'lon':vv}...], [{...}], ... ]

  return 'uid'
 
**/
function makePixiOverlayLayer(uid,pixiLatlngList,spec) {

    var pixiContainer = null;
    var overlay = null;
    var groups = [];

    var zoomChangeTs = null;
    var pixiContainer = null;

    var opacity = PIXI_DEFAULT_OPACITY;
    var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if(PIXI_pixiOverlayList.length == 0) { // first one
      pixiContainer = new PIXI.Container({vertices: true, tint: true});
      } else {
        pixi=PIXI_pixiOverlayList[0];
        pixiContainer = pixi.top;
        overlay = pixi.overlay;
        groups = pixi.groups;
    }

    pixiContainer.alpha=opacity;

    var pContainers=[]; //particle container
    var segments=[];

// set the markerTexturesPtr to the right set
    var segment_color_list;

    markerTexturesPtr=getMarkerTextures(spec.rgb_set);
    segment_color_list=getSegmentMarkerRGBList(spec.rgb_set);

    var segment_label_list=pixiGetSegmentRangeList(DATA_SEGMENT_COUNT, DATA_MAX_V, DATA_MIN_V);

    for(let i=0; i<DATA_SEGMENT_COUNT; i++) {
      var length=getMarkerCount(pixiLatlngList,i);

      var a = new PIXI.ParticleContainer(length, {vertices: true, tint: true});
      a.texture = markerTexturesPtr[i];
      a.baseTexture = markerTexturesPtr[i].baseTexture;
      a.anchor = {x: 0.5, y: 0.5};
      a.visible = true;

      // each set shares the same segment_gid, using uid as master global id
      a.csm_properties = { segment_gid:uid,
                           segment_name:"segment_"+i,
                           segment_cnt:length,
                           segment_label: segment_label_list[i],
                           segment_label_end: segment_label_list[i+1],
                           segment_color: segment_color_list[i]};          

      pixiContainer.addChild(a);
      pContainers.push(a);
    }

    if(overlay != null) {
        if(pixi.visible == false) {
           // add to the map first,
window.console.log("XXX === need to add back the layer..");
// XXX           viewermap.addLayer(overlay);
        }
        overlay.redraw({type: 'redraw', data: {'pixiLatlngList':pixiLatlngList,'spec':spec }});

      } else { 
        overlay=L.pixiOverlay(function(utils, event) {

window.console.log("PIXI: calling pixiOverlay - callback");

        if(event.type == "undefined") {
          window.console.log(" ???? XXX why is event type of undefined ???");
        }

        var zoom = utils.getMap().getZoom();
        var container = utils.getContainer();
        var renderer = utils.getRenderer();
        pixi_project = utils.latLngToLayerPoint;
        var getScale = utils.getScale;
        var invScale = 1 / getScale();
  
        if (event.type === "redraw") {
window.console.log(" >>>   PIXI: redraw event");

          var data=event.data;

          if(data != undefined) {
window.console.log(" >>>   PIXI: redraw event -- with data update");
            pixiLatlngList=data.pixiLatlngList;
            uid=pixiLatlngList.uid;
            spec=data.spec;

            let mapcenter=viewermap.getCenter();
            let mapzoom=viewermap.getZoom();
  
            var origin = pixi_project([mapcenter['lat'], mapcenter['lng']]);
  
            let scaleFactor=16; // default came from seismicity
            if(spec.scale_hint == 2 ) { // when grid points are about 2km len is 70k
              scaleFactor=24;
            }
            if(spec.scale_hint == 5) {  // when grid points are about 5km
              scaleFactor=8; 
            }
  
  // :-) very hacky, just in case it got zoomed in before search
            let t= (8/invScale);
            scaleFactor=scaleFactor / t;
  
          // fill in the particles one group at a time
            let collect_len=0;
            segments=[];
            for(var i=0; i< DATA_SEGMENT_COUNT; i++ ) {
  
               var latlngs=getMarkerLatlngs(pixiLatlngList,i);
               var len=latlngs.length;
  
               var a=pContainers[i];
               a.x = origin.x;
               a.y = origin.y;
               a.localScale = invScale/scaleFactor;
  
               collect_len=collect_len+len;
  //window.console.log("PIXI: group ",i," len is ",len);
               segments.push(len);
               for (var j = 0; j < len; j++) {
                  var latlng=latlngs[j];
                  var ll=latlng['lat'];
                  var gg=latlng['lng'];
                  var coords = pixi_project([ll,gg]);
              
                  var marker = new PIXI.TilingSprite(markerTexturesPtr[i]);
                  marker.clampMargin = -0.5;
               
                  marker.alpha=1; // add, multiply,screen
                  marker.blendMode=0; // add, multiply,screen
  
                  marker.x = coords.x - origin.x;
                  marker.y= coords.y - origin.y;
    
                  marker.scale.set(invScale/scaleFactor);
                  a.addChild(marker);
              }
            }
            groups.push( { "uid":uid, "visible":true, "segments":segments, "opacity": opacity, inner:pContainers} ); 
            pixi.visble=true;
            pixi.active_uid=uid;
            pixi.active_opacity=opacity;		    

	    // XXX debug
	    let gptr=groups; 
            let pptr=PIXI_pixiOverlayList;
            renderer.render(container,{ antialias: false, resolution:2 });
          } else { return ; }
        }
  
        if (event.type === 'add') {

          if (_foundOverlay(uid)) { // only add it first time
            return;
          }
  
          let mapcenter=viewermap.getCenter();
          let mapzoom=viewermap.getZoom();
  
          var origin = pixi_project([mapcenter['lat'], mapcenter['lng']]);
  
          let scaleFactor=16; // default came from seismicity
          if(spec.scale_hint == 2 ) { // when grid points are about 2km len is 70k
            scaleFactor=24;
          }
          if(spec.scale_hint == 5) {  // when grid points are about 5km
            scaleFactor=8; 
          }
  
  // :-) very hacky, just in case it got zoomed in before search
          let t= (8/invScale);
          scaleFactor=scaleFactor / t;
  
          // fill in the particles one group at a time
          let collect_len=0;
          segments=[];
          for(var i=0; i< DATA_SEGMENT_COUNT; i++ ) {
  
             var latlngs=getMarkerLatlngs(pixiLatlngList,i);
             var len=latlngs.length;
  
             var a=pContainers[i];
             a.x = origin.x;
             a.y = origin.y;
             a.localScale = invScale/scaleFactor;
  
             collect_len=collect_len+len;
  //window.console.log("PIXI: group ",i," len is ",len);
             segments.push(len);
             for (var j = 0; j < len; j++) {
                var latlng=latlngs[j];
                var ll=latlng['lat'];
                var gg=latlng['lng'];
                var coords = pixi_project([ll,gg]);
  
  
  // our patched particleContainer accepts simple {x: ..., y: ...} objects as children:
  //window.console.log("    and xy at "+coords.x+" "+coords.y);
              
                var marker = new PIXI.TilingSprite(markerTexturesPtr[i]);
                marker.clampMargin = -0.5;
               
                marker.alpha=1; // add, multiply,screen
                marker.blendMode=0; // add, multiply,screen
  
                marker.x = coords.x - origin.x;
                marker.y= coords.y - origin.y;
  
                marker.scale.set(invScale/scaleFactor);
                a.addChild(marker);
             }
          }
//window.console.log("PIXI: total of len, ",collect_len); 
       }

       renderer.render(container,{ antialias: false, resolution:2 });
    }, pixiContainer, {
      doubleBuffering: doubleBuffering,
      destroyInteractionManager: true
    }).addTo(viewermap);

    groups.push( { "uid":uid, "visible":true, "segments":segments, "opacity": opacity, inner:pContainers} ); 
    PIXI_pixiOverlayList.push({ "visible":true, "active_uid":uid, "active_opacity":opacity, "overlay":overlay,
                           "top":pixiContainer, "groups": groups });
   }

window.console.log(">>> PIXI..adding into poxiOverlayList with uid of:",uid);

    let tmp=PIXI_pixiOverlayList[0];
    return uid;
}


/*************************************************************************/
// utilities for a group -
//({"uid":uid,"visible":true,"segments":segments,"opacity":opacity,inner:pContainers}) 
//return pidx, and group
function pixiFindPixiWithUid(uid) {
    for(let i=0; i< PIXI_pixiOverlayList.length; i++) {
        let groups=PIXI_pixiOverlayList[i].groups;
        for(let j=0; j<groups.length; j++) {
          let group=groups[j];
          if(group.uid ==  uid) {
            return {"pidx":i, "pixi":group};
          }
        }
    }
    return null;
}

function pixiFindPixiSegmentsWithUid(uid) {
    let ret=pixiFindPixiWithUid(uid);
    if(ret != null) {
        let pixi=ret.pixi;
        return pixi.segments;   
    }
    return null;
}


function pixiFindPixiOpacityWithUid(uid) {
    let ret=pixiFindPixiWithUid(uid);
    if(ret != null) {
        let pixi=ret.pixi;
        return pixi.opacity;   
    }
    return null;
}

function pixiFindPixiVisibleWithUid(uid) {
    let ret=pixiFindPixiWithUid(uid);
    if(ret != null) {
        let pixi=ret.pixi;
        return pixi.visible;   
    }
    return null;
}

function _foundOverlay(uid) {
    let ret=pixiFindPixiWithUid(uid);
    if(ret != null) {
        return 1;
    }
    return 0;
}

function _toggleInnerGroupSegment(target,pidx,sidx) {
    let layer=PIXI_pixiOverlayList[pidx];
    let overlay=layer.overlay;
    let top=layer.top;
    let groups=layer.groups;
    for(let j=0; j< groups.length; j++) {
        let group=groups[j];
        if(group.uid == target) { // found it.
            if(group.visible == true) {
              let tmp=group.inner;
              if(sidx < tmp.length) {
                let chunk=tmp[sidx];
                if(chunk.visible ==true) {
                  top.removeChild(chunk);
                  chunk.visible=false;
                  } else {
                    top.addChild(chunk);
                    chunk.visible=true;
                }
                overlay.redraw(chunk);
              }
            }
            return;
        }
    }
}


function _clearInnerGroup(target,pidx) {
    let layer=PIXI_pixiOverlayList[pidx];
    let top=layer.top;
    let overlay=layer.overlay;
    let groups=layer.groups;
    for(let j=0; j< groups.length; j++) {
        let group=groups[j];
        if(group.uid == target) { // found it.
            if(group.visible == true) {
              let tmp=group.inner;
              for(let j=0; j<tmp.length; j++) {
                let chunk=tmp[j];
                chunk.visible=false;
                top.removeChild(chunk);
              }
              group.visible=false;
window.console.log("PIXI: clear one group..uid=",group.uid);
              overlay.redraw({type: 'redraw'});
              } else {
                return;
            }
        }
    }
}
function _addInnerGroup(target,pidx) {
    let layer=PIXI_pixiOverlayList[pidx];
    let top=layer.top;
    let overlay=layer.overlay;
    let groups=layer.groups;
    for(let j=0; j< groups.length; j++) {
        let group=groups[j];
        if(group.uid == target) { // found it.
            if(group.visible == false) {
              let tmp=group.inner;
              for(let j=0; j<tmp.length; j++) {
                let chunk=tmp[j];
                chunk.visible=true;
                top.addChild(chunk);
              }
window.console.log("PIXI: adding one group..uid=",group.uid);
              top.alpha=group.opacity;
              group.visible=true;
              overlay.redraw({type: 'redraw'});
              } else {
                return;
            }
        }
    }
}

/*************************************************************************/
//({"active_uid":uid,"active_opacity":opacity,"overlay":overlay,"top":pixiContainer,"groups": groups")
function pixiFindPixiOverlayByIdx(pidx=0) {
    if(PIXI_pixiOverlayList.length < pidx) return null;
    let tmp=PIXI_pixiOverlayList[pidx];
    return tmp.overlay;
}

function pixiFindPixiContainerByIdx(pidx=0) {
    if(PIXI_pixiOverlayList.length < pidx) return null;
    let tmp=PIXI_pixiOverlayList[pidx];
    return tmp.top;
}

/*************************************************************************/
/* there is just 1 overlay with different groups of pContainers/inner,
   clearing the pixi overlay means remove current active group's container
   from the viewer map 
({"uid":uid,"visible":true,"segments":segments,"opacity":opacity,inner:pContainers}) 
*/
function pixiClearAllPixiOverlay() {
    for(let i=0; i< PIXI_pixiOverlayList.length; i++) {
        let layer=PIXI_pixiOverlayList[i];
        if(layer.visible == false) {
          continue;
        }
        let target=layer.active_uid;
        let overlay=layer.overlay;
        _clearInnerGroup(target,i);
        layer.active_uid=null;
        layer.active_opacity=0;
        layer.visible=false;
//XXX	viewermap.removeLayer(overlay);    
    }
}

function pixiShowPixiOverlay(uid) {
    let ret=pixiFindPixiWithUid(uid);
    if(ret == null) return;
    let pidx=ret.pidx; 
    let pixi=ret.pixi;
    let opacity=pixi.opacity;
    let layer=PIXI_pixiOverlayList[pidx];
    let overlay = layer.overlay;
    let active=layer.active_uid;

    if(layer.visible == true) {
      if(active == uid) return; // do nothing
      // turn off the current one
      _clearInnerGroup(active,pidx);
    } 

    _addInnerGroup(uid,pidx);
    layer.active_uid=uid;
    layer.active_opacity=opacity;
// not sure if this is needed
    overlay.redraw({type: 'redraw'});

    if(layer.visible == false) {
//XXX      viewermap.addLayer(overlay);
    }
    layer.visible=true;
}


// from a overlay that has this uid 
function pixiGetPixiOverlayOpacity(uid) {
    let ret=pixiFindPixiWithUid(uid);
    if(ret == null) return;
    let pidx=ret.pidx; 
    let pixi=ret.pixi;

    let layer=PIXI_pixiOverlayList[pidx];
    let opacity=pixi.opacity;

// should be the same
    if( (layer.active_uid != uid) || (pixi.opacity != layer.active_opacity)) {
      window.console.log("pixiGetPixiOverlayOpacity.. BAD.. should match");
    }
    return opacity;
}

function pixiSetPixiOverlayOpacity(uid,alpha) {
    let ret=pixiFindPixiWithUid(uid);
    if(ret == null) return;
    let pidx=ret.pidx; 
    let pixi=ret.pixi;
    pixi.opacity=alpha;

    let layer=PIXI_pixiOverlayList[pidx];
    let overlay=layer.overlay;
    let pContainer=layer.top;

// should be the same
    if(layer.active_uid != uid) {
      window.console.log("pixiGetPixiOverlayOpacity.. BAD.. should match");
    }
    layer.active_opacity=alpha; 

    pContainer.alpha=alpha;
    overlay.redraw({type: 'redraw'});
}

function pixiResetAllOverlayOpacity() {
  for(let i=0; i< PIXI_pixiOverlayList.length; i++) {
    let layer=PIXI_pixiOverlayList[i];
    if(layer.visible == false) {
      continue;
    }
    if(layer.active_opacity == PIXI_DEFAULT_OPACITY) {
      continue;
    }
    let target=layer.active_uid;
    let overlay=layer.overlay;
    let pContainer=layer.top;
    let groups=layer.groups;
    for(let j=0; j<groups.length; j++) {
       let t=groups[i];
        if(t.uid == target) {
          t.opacity=PIXI_DEFAULT_OPACITY;
          break;
        }
    }
    layer.active_opacity=PIXI_DEFAULT_OPACITY;
    pContainer.alpha=PIXI_DEFAULT_OPACITY;
    overlay.redraw({type: 'redraw'});
  }
}

/*************************************************************************/
// for debug toggling a chunk from pContainers
// toggle off a child container from an overlay layer
function pixiToggleMarkerContainer(uid,target_segment_idx) {

  let ret=pixiFindPixiWithUid(uid);
  if(ret == null) return;

  let pixi=ret.pixi;
  let pidx=ret.pidx;

  let layer=PIXI_pixiOverlayList[pidx];
  let top=layer.top;
  let groups=layer.groups;

  if(layer.visible==false || pixi.visible==false) {
    window.console.log("PIXI: grouplayer not visible To TOGGLE!!\n");
    return;
  } 
  _toggleInnerGroupSegment(uid,pidx,target_segment_idx);
}

/*************************************************************************/
// for CGM
// order everything into a sorted array
// break up data into buckets (one per segment)
// input : lon lat vel
// returns :
//    {"uid":uid,"data":[ [{"lat":lat,"lng":lng},...], ...] }
function _loadup_data_url(uid,url) {
   let data_max_v=null;
   let data_min_v=null;
   DATA_count=0;

   let rawlist=[];
   let pixiLatlngList;
   let datalist=[];
   
   for(var i=0; i<DATA_SEGMENT_COUNT; i++) {
      datalist.push([]);
   }

   let blob=ckExist(url);
   let tmp=blob.split("\n");
   let sz=tmp.length;

   for(let i=0; i<sz; i++) {
      let ll=tmp[i];
      if(ll[0]=='#') { // comment line
        continue;
      }           
      let token=ll.split(",");
      if(token.length != 7) {
         window.console.log("PIXI: invalid data in this line "+i+" >>"+token.length);
         
         continue;
      }
      let lon=parseFloat(token[0].trim());
      let lat=parseFloat(token[1].trim());
      let vel=token[2].trim();
      if(Number.isNaN(vel) || vel == "nan") {
          continue;
      }
      vel=parseFloat(vel);
      rawlist.push([vel,lat,lon]);
      if(data_max_v == null) {
          data_max_v = vel;
       data_min_v = vel;  
          } else {
              if(vel > data_max_v)
                data_max_v=vel;
              if(vel < DATA_min_v)
                data_min_v=vel;
      }
   }

   if(DATA_MAX_V == undefined) {
     DATA_MAX_V = data_max_v;
   }
   if(DATA_MIN_V == undefined) {
     DATA_MIN_V = data_min_v;
   }

   // sort datalist
   let sorted_rawlist = rawlist.sort((a,b) => {
          return b[0] - a[0];
   });
   let sorted_vlist=sorted_rawlist.map(function(value,index){ return value[0]; });

   DATA_count=sorted_rawlist.length;
   for(let i=0; i<DATA_count; i++ ) {
      let item=sorted_rawlist[i];
      let lon=item[2];
      let lat=item[1];
      let vel=item[0];
      let idx=pixiGetSegmentRangeIdx(vel, DATA_SEGMENT_COUNT, DATA_MAX_V, DATA_MIN_V);
      addMarkerLatlng(datalist,idx,lat,lon);
   }
   pixiLatlngList= {"uid":uid,"data":datalist} ; 

   window.console.log("PIXI: FILE:"+url+" total data:"+DATA_count+"("+data_min_v+","+data_max_v+")");
   return pixiLatlngList;
}

// this is from cgm
function makePixiOverlayLayerWithFile(uid,file) {
    var pixiLatlngList=_loadup_data_url(uid,file)
    let spec={'hint':0};
    return makePixiOverlayLayer(uid,pixiLatlngList,spec);
}


