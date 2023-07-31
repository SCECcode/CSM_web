/***
   cxm_pixi.js

***/

/* How many segments to chunk a set of data */
const PIXI_DEFAULT_DATA_SEGMENT_COUNT=undefined;

var DATA_SEGMENT_COUNT=undefined; // chunking supplied from client 
var DATA_MAX_V=undefined;
var DATA_MIN_V=undefined;
var DATA_count=undefined;

var pixi_cmap_tb=undefined;

/*************************************************************************/

/**
   a place to park all the pixiOverlay from the session 
   [ {"uid":uid, "vis":true, "segment":20, "layer": overlay,
     "top":pixiContainer,"inner":[ {"container":c0, "visible":1 }, ...],
     "latlnglist":pixiLatlngList} ] 

   for each overlay layer, this is all the data
     pixiLatlngList= {"uid":uid,"data":datalist} 
       (array of arrays)
       datalist[ [{'lat':v,'lon':vv}...], [{...}], ... ]

**/

/**

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

var pixiOverlayList=[];

/* expose pixiOverlay's util to global scope */
var pixi_project=null;

/* textures in a marker containeri */
var markerTexturesPtr;

var loadOnce=1;

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
function getSegmentRangeIdx(vs_target, N, vs_max, vs_min) {
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
  let pixi=pixiFindPixiWithUid(uid);

  if(pixi) {
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


// create a list of N values
function getSegmentRangeList(N, vs_max, vs_min) {
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

// get a list of rgbs from the table
function pixiGetSegmentMarkerRGBList(idx) {
  var mlist= [];
  let cmaps=pixi_cmap_tb.data_rgb;
  let sz=cmaps.length;
  if(idx < sz) {
     let cmap=cmaps[idx];
     rgbs=cmap.rgbs;
     for (const idx in rgbs) {
       mlist.push(rgbs[idx]);
     }
  }
  return mlist;
}

// no need to make a copy, just ref it
function refSegmentMarkerRGBList(idx) {
  let cmaps=pixi_cmap_tb.csm_cmaps_rgb;
  let cmap=cmaps[idx];
  return cmap.rgbs;
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
  pixiOverlayList=[];
  csm_init_pixi();
}


function setup_pixi() {
  if(loadOnce) {
    init_pixi();
    loadOnce=0;
  }
}

// toggle off a child container from an overlay layer
function pixiToggleMarkerContainer(uid,target_segment_idx) {

  let pixi=pixiFindPixiWithUid(uid);

  if(pixi.visible==false) {
    window.console.log("PIXI: layer not visible To TOGGLE!!\n");
    return;
  } 
  let layer=pixi.overlay;
  let clist=pixi.inner;
  let top=pixi.top;
  let seglist=pixi.segment;
  let sz=clist.length;

  let target_segment="segment_"+target_segment_idx;
  let tloc=0;

  let citem=clist[target_segment_idx]; // target particalContainer
  let term;
  let vis;
  for(let i=0; i<sz; i++) {
    let citem=clist[i];
    let term=citem.csm_properties;
    if(term.segment_name == target_segment) { // found the item
      tloc=i;
      if(citem.visible) { // toggle off
        top.removeChild(citem);
        citem.visible=false;
        vis=false;
        } else { // toggle on
          citem.visible=true;
          top.addChild(citem);
          vis=true;
      }
      // need to refresh the layer
      layer.redraw(citem);
      return vis;
    }
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
      let idx=getSegmentRangeIdx(val, DATA_SEGMENT_COUNT, DATA_MAX_V, DATA_MIN_V);
      addMarkerLatlng(datalist,idx,lat,lon);
   }
   pixiLatlngList= {"uid":uid,"data":datalist} ; 

   return pixiLatlngList;
}

// this is from csm
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
      let idx=getSegmentRangeIdx(vel, DATA_SEGMENT_COUNT, DATA_MAX_V, DATA_MIN_V);
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

// spec = {'data_max':3.0, 'data_min':1.0, 'seg_cnt':20};
// data_max and data_min is client specified limits
//
// pixiOverlayList.push({"uid":uid,"vis":1,"overlay":overlay,"top":pixiContainer,"inner":pContainers,"latlnglist":pixiLatlngList});
// return 'uid'
// 
function makePixiOverlayLayer(uid,pixiLatlngList,spec) {

    let zoomChangeTs = null;

/****
const filter = new PIXI.filters.AlphaFilter(1);
container.filters = [filter];
filter.alpha = 0.5; // <-- tween this propert

https://github.com/pixijs/pixijs/discussions/8025
*****/

    let pixiContainer = new PIXI.Container({vertices: true, tint: true});
    //let alphaFilter = new PIXI.AlphaFilter(1);
    //pixiContainer.filters = [alphaFilter];
    pixiContainer.alpha=0.8;

    let pContainers=[]; //particle container
    let segments=[];

// set the markerTexturesPtr to the right set
    let segment_color_list;
    if(spec.rgb_set == 0) {
      markerTexturesPtr=markerTexturesSet0;
      segment_color_list=getSegmentMarkerRGBList(0);
    } else if (spec.rgb_set == 1 ) {
      markerTexturesPtr=markerTexturesSet1;
      segment_color_list=getSegmentMarkerRGBList(1);
    } else {
      markerTexturesPtr=markerTexturesSet2;
      segment_color_list=getSegmentMarkerRGBList(2);
    }
    let segment_label_list=getSegmentRangeList(DATA_SEGMENT_COUNT, DATA_MAX_V, DATA_MIN_V);


    for(var i=0; i<DATA_SEGMENT_COUNT; i++) {
      var length=getMarkerCount(pixiLatlngList,i);

      var a = new PIXI.ParticleContainer(length, {vertices: true, tint: true});
      // add properties for our patched particleRenderer:
      a.texture = markerTexturesPtr[i];
      a.baseTexture = markerTexturesPtr[i].baseTexture;
      a.anchor = {x: 0.5, y: 0.5};
      a.visible = 1;

      a.csm_properties = { segment_name:"segment_"+i,
                           segment_cnt:length,
                           segment_label: segment_label_list[i],
                           segment_label_end: segment_label_list[i+1],
                           segment_color: segment_color_list[i]};          

      pixiContainer.addChild(a);
      pContainers.push(a);
    }

    var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    var overlay=L.pixiOverlay(function(utils, event) {

//window.console.log("PIXI:event type --- ", event.type);

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
//window.console.log(" >>>   PIXI: redraw event");
        renderer.render(container);
      }

      if (event.type === 'add') {
//window.console.log("PIXI: add event");

        if (_foundOverlay(uid)) { // only add it first time
          return;
        }

        let mapcenter=viewermap.getCenter();
        let mapzoom=viewermap.getZoom();

        var origin = pixi_project([mapcenter['lat'], mapcenter['lng']]);

        let scaleFactor=16; // default came from seismicity
        if(spec.scale_hint == 2 ) { // when grid points are about 2km len is 70k
		scaleFactor=24;
          //scaleFactor=6;
          //scaleFactor=10;
        }
        if(spec.scale_hint == 5) {  // when grid points are about 5km
          scaleFactor=8; 
        }

// :-) very hacky, just in case it got zoomed in before search
        let t= (8/invScale);
        scaleFactor=scaleFactor / t;

//window.console.log("PIXI:in L.pixiOverlay layer, auto zoom at "+zoom+" scale at>"+getScale()+" invScale"+invScale+"localscale is "+(invScale/scaleFactor));

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
            
/** XXX  orginail way, 
              var aParticle=a.addChild({ x: coords.x - origin.x, y: coords.y - origin.y });
**/

              var marker = new PIXI.TilingSprite(markerTexturesPtr[i]);
        //      var marker = new PIXI.Sprite(markerTexturesPtr[i]);
              marker.clampMargin = -0.5;
              //TilingSprite: marker.clampMargin = -0.5;
             
              marker.alpha=1; // add, multiply,screen
              marker.blendMode=0; // add, multiply,screen

              marker.x = coords.x - origin.x;
              marker.y= coords.y - origin.y;

              marker.scale.set(invScale/scaleFactor);

             /*
marker.popup = L.popup({className: 'pixi-popup'})
                 .setLatLng(latlng)
                 .setContent('<b>Hello world!</b><br>I am a popup.'+ latlng['lat']+' '+latlng['lng']).openOn(viewermap);
           */
 
/*
let mx = coords.x - origin.x;
let my = coords.y - origin.y;
let nx = mx+0.01;
let ny = my+0.01;
//var bounds = [[mx, my], [nx,ny]];
var bounds=[[34.0105, -120.8415], [34.011, -120.8]];
var marker = new PIXI.Point([34.0105, -120.8415], {color: "#ff7800", weight: 1} );
*/

              var aParticle=a.addChild(marker);
           }
        }
window.console.log("PIXI: total of len, ",collect_len); 
     }

// camera ??      renderer.render(container,{ antialias: true, resolution:2 });
     renderer.render(container,{ antialias: false, resolution:2 });
    }, pixiContainer, {
      doubleBuffering: doubleBuffering,
      destroyInteractionManager: true
    }).addTo(viewermap);

    pixiOverlayList.push({"uid":uid,"visible":1,"segment":segments,"overlay":overlay,"top":pixiContainer,"inner":pContainers,"latlnglist":pixiLatlngList});

window.console.log(">>> PIXI..adding into poxiOverlayList with uid of:",uid);

    return uid;
}


function pixiFindSegCntWithUid(uid) {
   let seg=pixiFindSegmentsWithUid(uid);
   if(seg) return seg.length;
   return 0;
}
     
/// { val1, val2, val3, .. val20 }
function pixiFindSegmentsWithUid(uid) {
  for(let i=0; i<pixiOverlayList.length; i++) {
     let pixi=pixiOverlayList[i];
     if(pixi.uid == uid) {
       return pixi.segments;
     }
  }
  return 0;
}

function pixiFindSegmentsWithUid(uid) {
    let pixi=pixiFindPixiWithUid(uid);
    if(pixi) return pixi.segment;
    return null;
}

function pixiFindOverlayWithUid(uid) {
    let pixi=pixiFindPixiWithUid(uid);
    if(pixi) return pixi.overlay;
    return null;
}

function pixiFindPixiWithUid(uid) {
  for(let i=0; i<pixiOverlayList.length; i++) {
     let pixi=pixiOverlayList[i];
     if(pixi.uid == uid) {
       return pixi;
     }
  }
  return null;
}
function _foundOverlay(uid) {
  for(let i=0; i<pixiOverlayList.length; i++) {
     let pixi=pixiOverlayList[i];
     if(pixi.uid == uid) {
       return 1;
     }
  }
  return 0;
}

function pixiClearPixiOverlay(uid) {
    let pixi=pixiFindPixiWithUid(uid);
    if(pixi && pixi.visible == 1) {
       let layer=pixi.overlay;
       viewermap.removeLayer(layer);
       pixi.visible=0;
window.console.log("PIXI: clear one..uid=",pixi.uid);
    }
}

function pixiClearAllPixiOverlay() {
  let cnt=pixiOverlayList.length;
  for(let i=0; i<cnt; i++) {
    let pixi=pixiOverlayList[i];
    if(pixi.visible == 1) {
       let layer=pixi.overlay;
       viewermap.removeLayer(layer);
       pixi.visible=0;
window.console.log("PIXI: clear All..uid=",pixi.uid);
    }
  }
}

function pixiTogglePixiOverlay(uid) {
    let pixi=pixiFindPixiWithUid(uid);
    let v=pixi.visible;
    let layer=pixi.overlay;
    if(v==1) {
       pixi.visible=0;
       viewermap.removeLayer(layer);
       } else {
         viewermap.addLayer(layer);
         pixi.visible=1;
    }
}

//pixiOverlayList.push({"uid":uid,"visible":1,"segment":segments,"overlay":overlay,"top":pixiContainer,"inner":pContainers,"latlnglist":pixiLatlngList});
function pixiSetPixiOpacity(uid, alpha) {
    let pixi=pixiFindPixiWithUid(uid);
    let v=pixi.visible;
    let layer=pixi.overlay;
    if(v==1) {
       let pContainer=pixi.top;
       pContainer.alpha=alpha;
       layer.redraw({type: 'redraw'});
    }
}

//pixiOverlayList.push({"uid":uid,"visible":1,"segment":segments,"overlay":overlay,"top":pixiContainer,"inner":pContainers,"latlnglist":pixiLatlngList});
function pixiGetPixiOpacity(uid) {
    let pixi=pixiFindPixiWithUid(uid);
    if(pixi == null) {
     window.console.log("BAD.. pixi is not found with uid",  uid);
     return 0.8;
    }
    let layer=pixi.overlay;
    let pContainer=pixi.top;
    opacity=pContainer.alpha;
    return opacity;
}
