/***
   cxm_pixi.js
***/

/* marker's resizing size's zoom threshold */
var vs_zoom_threshold=5;

// pixi, Leafle.overlayLayer.js
/* data sections, to matching marker name markerN_icon.png */
const DEFAULT_DATA_SEGMENT_COUNT= 20; // marker name from 1 to 20

var DATA_SEGMENT_COUNT=0; // supplied from client 

var DATA_MAX_V=undefined;
var DATA_MIN_V=undefined;
var DATA_count=0;

/********************************************/
/* a place to park all the pixiOverlay from the session */
/* [ {"gid":gid, "vis":true, "segment":20, "layer": overlay,         */
/*    "top":pixiContainer,"inner":[ {"container":c0, "vis":1 }, ...], "latlnglist":pixiLatlngList} ] */
var pixiOverlayList=[];

/* PixiOverlayLayer */
var pixiLayer = null;

/* expose pixiOverlay's util to global scope */
var pixi_project=null;

/* textures in a marker container                         */
/* [ markerTexture0, markerTexture1,... markerTexture19 ] */
var markerTextures=[];

var loadOnce=1;

function printMarkerLatlngInfo(plist) {
  let sum=0;
  window.console.log("PIXI: For: "+plist.gid);
  for(let i=0; i<DATA_SEGMENT_COUNT; i++) {
    let dlist=plist[i];
    sum=sum+data.length;
    window.console.log("PIXI:    i: "+i+" count: "+ dlist.length);
  }
  window.console.log("PIXI:  sum up :"+sum);
}

function updateMarkerLatlng(plist,idx,lat,lng) {
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

function getRangeIdx(vs_target, vs_max, vs_min) {
  if(vs_target <= vs_min) {
    return 0;  
  }
  if(vs_target >= vs_max) {
    return DATA_SEGMENT_COUNT-1;
  }
  var step = (vs_max - vs_min)/DATA_SEGMENT_COUNT;
  var offset= Math.floor((vs_target-vs_min)/step);
  return offset;
}

// from pixi,
//  >> Adds a BaseTexture to the global BaseTextureCache. This cache is shared across the whole PIXI object.
// PIXI.BaseTexture.addToCache (baseTexture, id)
// PIXI.BaseTexture.from (source, options, strict) PIXI.BaseTexture static
//
function init_pixi(loader) {
  pixiOverlayList=[];

  let marker1Texture = PIXI.Texture.from('img/marker1_icon.png');
  let marker2Texture = PIXI.Texture.from('img/marker2_icon.png');
  let marker3Texture = PIXI.Texture.from('img/marker3_icon.png');
  let marker4Texture = PIXI.Texture.from('img/marker4_icon.png');
  let marker5Texture = PIXI.Texture.from('img/marker5_icon.png');
  let marker6Texture = PIXI.Texture.from('img/marker6_icon.png');
  let marker7Texture = PIXI.Texture.from('img/marker7_icon.png');
  let marker8Texture = PIXI.Texture.from('img/marker8_icon.png');
  let marker9Texture = PIXI.Texture.from('img/marker9_icon.png');
  let marker10Texture = PIXI.Texture.from('img/marker10_icon.png');
  let marker11Texture = PIXI.Texture.from('img/marker11_icon.png');
  let marker12Texture = PIXI.Texture.from('img/marker12_icon.png');
  let marker13Texture = PIXI.Texture.from('img/marker13_icon.png');
  let marker14Texture = PIXI.Texture.from('img/marker14_icon.png');
  let marker15Texture = PIXI.Texture.from('img/marker15_icon.png');
  let marker16Texture = PIXI.Texture.from('img/marker16_icon.png');
  let marker17Texture = PIXI.Texture.from('img/marker17_icon.png');
  let marker18Texture = PIXI.Texture.from('img/marker18_icon.png');
  let marker19Texture = PIXI.Texture.from('img/marker19_icon.png');
  let marker20Texture = PIXI.Texture.from('img/marker20_icon.png');

  PIXI.BaseTexture.addToCache(marker1Texture,"marker1");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker2");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker3");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker4");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker5");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker6");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker7");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker8");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker9");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker10");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker11");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker12");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker13");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker14");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker15");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker16");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker17");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker18");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker19");
  PIXI.BaseTexture.addToCache(marker1Texture,"marker20");

  markerTextures.push(marker1Texture);
  markerTextures.push(marker2Texture);
  markerTextures.push(marker3Texture);
  markerTextures.push(marker4Texture);
  markerTextures.push(marker5Texture);
  markerTextures.push(marker6Texture);
  markerTextures.push(marker7Texture);
  markerTextures.push(marker8Texture);
  markerTextures.push(marker9Texture);
  markerTextures.push(marker10Texture);
  markerTextures.push(marker11Texture);
  markerTextures.push(marker12Texture);
  markerTextures.push(marker13Texture);
  markerTextures.push(marker14Texture);
  markerTextures.push(marker15Texture);
  markerTextures.push(marker16Texture);
  markerTextures.push(marker17Texture);
  markerTextures.push(marker18Texture);
  markerTextures.push(marker19Texture);
  markerTextures.push(marker20Texture);
}


function setup_pixi() {
  if(loadOnce) {
    init_pixi();
    loadOnce=0;
  }
}

function makeOnePixiLayer(gid,file) {

  makePixiOverlayLayer(gid,file);
  let pixiLayer = pixiFindPixiWithGid(gid);

  let ticker = new PIXI.Ticker();

  ticker.add(function(delta) { 
    pixiLayer.redraw({type: 'redraw', delta: delta});
  });

  viewermap.on('changestart', function() { ticker.start(); });
  viewermap.on('changeend', function() { ticker.stop(); });
  viewermap.on('zoomstart', function() { ticker.start(); });
  viewermap.on('zoomend', function() { ticker.stop(); });
  viewermap.on('zoomanim', pixiLayer.redraw, pixiLayer);

  return {"pixiLayer":pixiLayer,"max_v":DATA_MAX_V,"min_v":DATA_MIN_V,"count_v":DATA_count };
}

// toggle off a child container from an overlay layer
function pixiToggleMarkerContainer(gid,target_segment) {

window.console.log("PIXI: toggleMarker container..which segment..",target_segment);
  let pixi=pixiFindPixiWithGid(gid);

  if(pixi.visible==false) {
    window.console.log("PIXI: layer not visible To TOGGLE!!\n");
    return;
  } 
  let layer=pixi.overlay;
  let clist=pixi.inner;
  let top=pixi.top;
  let segcnt=pixi.segment;

  let citem=clist[target_segment]; // target particalContainer
  if(citem.visible) { // toggle off
    citem.visible=false;
    top.removeChildAt(target_segment);
    } else {
      citem.visible=true;
      top.addChildAt(citem, target_segment);
  }
// need to refresh the layer
  layer.redraw(target_segment);
}


// order everything into a sorted array
// break up data into buckets (one per segment)
// input : latlist, lonlist, vallist
// returns :
//    {"gid":gid,"data":[ [{"lat":lat,"lng":lng},...], ...] }
function _loadup_data_list(gid,latlist,lonlist,vallist) {

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
      let idx=getRangeIdx(val, DATA_MAX_V, DATA_MIN_V);
      updateMarkerLatlng(datalist,idx,lat,lon);
   }
window.console.log("PIXI: HUMHUM..",DATA_count);
   pixiLatlngList= {"gid":gid,"data":datalist} ; 

   return [DATA_count, pixiLatlngList];
}

// this is from csm
function makePixiOverlayLayerWithList(gid,latlist,lonlist,vallist,spec) {
    var pixiLatlngList;
    var count;	 

    if(spec.seg_cnt) { 
      DATA_SEGMENT_COUNT = spec.seg_cnt;
      } else {
        DATA_SEGMENT_COUNT = DEFAULT_DATA_SEGMENT_COUNT;
    }
    if(spec.data_max) { 
      DATA_MAX_V = spec.data_max;
      } else {
        DATA_MAX_V = undefined;
    }
    if(spec.data_min) { 
      DATA_MIN_V = spec.data_min;
      } else {
        DATA_MIN_V = undefined;
    }

    [count, pixiLatlngList]=_loadup_data_list(gid,latlist,lonlist,vallist);
    spec.scale_hint=count;

window.console.log("PIXI:SEG_COUNT " + DATA_SEGMENT_COUNT);
window.console.log("PIXI:DATA_MAX " + DATA_MAX_V);
window.console.log("PIXI:DATA_MIN " + DATA_MIN_V);

    return makePixiOverlayLayer(gid,pixiLatlngList,spec);
}

// order everything into a sorted array
// break up data into buckets (one per segment)
// input : lon lat vel
// returns :
//    {"gid":gid,"data":[ [{"lat":lat,"lng":lng},...], ...] }
function _loadup_data_url(gid,url) {
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
      let idx=getRangeIdx(vel, DATA_MAX_V, DATA_MIN_V);
      updateMarkerLatlng(datalist,idx,lat,lon);
   }
   pixiLatlngList= {"gid":gid,"data":datalist} ; 

   window.console.log("PIXI: FILE:"+url+" total data:"+DATA_count+"("+data_min_v+","+data_max_v+")");
   return pixiLatlngList;
}

// this is from cgm
function makePixiOverlayLayerWithFile(gid,file) {
    var pixiLatlngList=_loadup_data_url(gid,file)
    let spec={'hint':0};
    return makePixiOverlayLayer(gid,pixiLatlngList,spec);
}

// spec = {'data_max':3.0, 'data_min':1.0, 'seg_cnt':20};
// data_max and data_min is client specified limits
//
// pixiOverlayList.push({"gid":gid,"vis":1,"overlay":overlay,"top":pixiContainer,"inner":pContainers,"latlnglist":pixiLatlngList});
// return 'gid'
// 
function makePixiOverlayLayer(gid,pixiLatlngList,spec) {

    let zoomChangeTs = null;

    let pixiContainer = new PIXI.Container();
    let pContainers=[]; //particle container

    for(var i=0; i<DATA_SEGMENT_COUNT; i++) {
      var length=getMarkerCount(pixiLatlngList,i);
//XXX,  new PIXI.particles.ParticleContainer(maxSize, properties, batchSize)
      var a = new PIXI.ParticleContainer(length, {vertices: true, tint: true});
      // add properties for our patched particleRenderer:
      a.texture = markerTextures[i];
      a.baseTexture = markerTextures[i].baseTexture;
      a.anchor = {x: 0.5, y: 0.5};

      pixiContainer.addChild(a);
      pContainers.push(a);
    }

    var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var initialScale;

    var overlay=L.pixiOverlay(function(utils, event) {

window.console.log("PIXI:event type --- ", event.type);

      var zoom = utils.getMap().getZoom();
      var container = utils.getContainer();
      var renderer = utils.getRenderer();
      pixi_project = utils.latLngToLayerPoint;
      var getScale = utils.getScale;
      var invScale = 1 / getScale();
window.console.log("PIXI:in L.pixiOverlay layer, auto zoom at "+zoom+" scale at>"+getScale()+" invScale"+invScale);

      if (event.type === "redraw") {
window.console.log("PIXI: redraw event");
      }

      if (event.type === 'add') {
window.console.log("PIXI: add event");

        if (_foundOverlay(gid)) { // only add it first time
          return;
        }

        let mapcenter=viewermap.getCenter();
        let mapzoom=viewermap.getZoom();

        var origin = pixi_project([mapcenter['lat'], mapcenter['lng']]);
        initialScale = invScale/16; 
// initial size of the marker for 70k pts
window.console.log("PIXI: scale_hint:"+spec.scale_hint);
	if(spec.scale_hint != 0) { // THIS IS A HACK...
          if(spec.scale_hint < 50000)
             initialScale = invScale/5; 
// for 10k pts
          if(spec.scale_hint < 20000)
             initialScale = invScale/3; 
          if(spec.scale_hint < 10000) // for SAFPoly3D
             initialScale = invScale/7; 
        }

        // fill in the particles one group at a time
        let collect_len=0;
        for(var i=0; i< DATA_SEGMENT_COUNT; i++ ) {

// show first one, in the middle and the last
//if(i !=12 && i !=10 ) continue;	 
//if(i != Math.floor(DATA_SEGMENT_COUNT/2) && i !=0 && i!= (DATA_SEGMENT_COUNT-1) ) continue;	 
           var a=pContainers[i];
           a.x = origin.x;
           a.y = origin.y;
           a.localScale = initialScale;

           var latlngs=getMarkerLatlngs(pixiLatlngList,i);
           var len=latlngs.length;
           collect_len=collect_len+len;
window.console.log("PIXI: group ",i," len is ",len);
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

var marker = new PIXI.Sprite(markerTextures[i]);
marker.x = coords.x - origin.x;
marker.y= coords.y - origin.y;
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
/***/
           }
        }
window.console.log("PIXI: total of len, ",collect_len); 
     }

      renderer.render(container,{ antialias: true, resolution:2 });
    }, pixiContainer, {
      doubleBuffering: doubleBuffering,
      destroyInteractionManager: true
    }).addTo(viewermap);

    pixiOverlayList.push({"gid":gid,"vis":1,"segment":DATA_SEGMENT_COUNT,"overlay":overlay,"top":pixiContainer,"inner":pContainers,"latlnglist":pixiLatlngList});

window.console.log(">>> PIXI..adding into poxiOverlayList with gid of:",gid);
window.console.log(">>> PIXI..size:",pixiOverlayList.length);

    return gid;
}

function pixiFindSegmentWithGid(gid) {
  for(let i=0; i<pixiOverlayList.length; i++) {
     let pixi=pixiOverlayList[i];
     if(pixi.gid == gid) {
       return pixi.segment;
     }
  }
  return 0;
}
function pixiFindOverlayWithGid(gid) {
  for(let i=0; i<pixiOverlayList.length; i++) {
     let pixi=pixiOverlayList[i];
     if(pixi.gid == gid) {
       return pixi.overlay;
     }
  }
  return null;
}

function pixiFindPixiWithGid(gid) {
  for(let i=0; i<pixiOverlayList.length; i++) {
     let pixi=pixiOverlayList[i];
     if(pixi.gid == gid) {
       return pixi;
     }
  }
  return null;
}
function _foundOverlay(gid) {
  for(let i=0; i<pixiOverlayList.length; i++) {
     let pixi=pixiOverlayList[i];
     if(pixi["gid"] == gid) {
       return 1;
     }
  }
  return 0;
}

function pixiClearAllPixiOverlay() {
  pixiOverlayList.forEach(function(pixi) {
    if(pixi !=null || pixi.length !=0) {
      if(pixi["vis"]==1) {
        var layer=pixi["overlay"];
        viewermap.removeLayer(layer);
        pixi["vis"]=0;
window.console.log("PIXI: clear All..",pixi["gid"]);
      }
    }
  });
}

function togglePixiOverlay(gid) {
window.console.log("PIXI: which gid to toggle PixiOverlay out..",gid);
  for(let i=0; i<pixiOverlayList.length; i++) {
     let pixi=pixiOverlayList[i];
     if(pixi["gid"] == gid) {
       let v=pixi["vis"];
       let layer=pixi["overlay"];
       if(v==1) {
         pixi["vis"]=0;
         viewermap.removeLayer(layer);
         } else {
           viewermap.addLayer(layer);
           pixi["vis"]=1;
       }
       return;
     }
  }
}
