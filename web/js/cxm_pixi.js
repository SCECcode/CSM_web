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
/* [ {"uid":uid, "vis":true, "segment":20, "layer": overlay,         */
/*    "top":pixiContainer,"inner":[ {"container":c0, "visible":1 }, ...], "latlnglist":pixiLatlngList} ] */
var pixiOverlayList=[];

/* expose pixiOverlay's util to global scope */
var pixi_project=null;

/* textures in a marker container                         */
/* [ markerTexture0, markerTexture1,... markerTexture19 ] */
var markerTextures=[];

var loadOnce=1;

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

function pixiFindSegmentPropertiesWithPixiGid(pixigid) {
  let rlist={};
  let namelist=[];
  let colorlist=[];
  let labellist=[];
  let lengthlist=[];
  let checklist=[];
  let pixi=pixiFindPixiWithPixiGid(pixigid);

  if(pixi) {
    let clist=pixi.inner;
    let sz=clist.length;

    let term;
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
  var slist= [];
  for(let i=0; i<N; i++) {
    let v= Math.floor((vs_min + (step * i ))*100)/100;
    slist.push(v);
  }
  return slist;
}

function getSegmentMarkerColorList() {
  var mlist= [];
  mlist.push("#e9d575");
  mlist.push("#c6dc64");
  mlist.push("#a1e35f");
  mlist.push("#a1e35f");
  mlist.push("#7ce767");
  mlist.push("#5de578");
  mlist.push("#47df91");
  mlist.push("#3cd2ac");
  mlist.push("#3cd2ac");
  mlist.push("#rbc0c5");
  mlist.push("#45aad7");
  mlist.push("#5492df");
  mlist.push("#677bdc");
  mlist.push("#677bdc");
  mlist.push("#7966cf");
  mlist.push("#8755b9");
  mlist.push("#8f489d");
  mlist.push("#8f407f");
  mlist.push("#8f407f");
  mlist.push("#873B57");
  return mlist;
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

function makeOnePixiLayer(uid,file) {

  makePixiOverlayLayer(uid,file);
  let pixiLayer = pixiFindPixiWithUid(uid);

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
function pixiToggleMarkerContainer(pixigid,target_segment_idx) {

window.console.log("PIXI: toggleMarker container..which segment..",target_segment_idx);
  let pixi=pixiFindPixiWithPixiGid(pixigid);

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
  for(let i=0; i<sz; i++) {
    let citem=clist[i];
    let term=citem.csm_properties;
    if(term.segment_name == target_segment) { // found the item
      tloc=i;
      if(citem.visible) { // toggle off
        top.removeChild(citem);
        citem.visible=false;
        } else { // toggle on
          citem.visible=true;
          top.addChild(citem);
      }
      // need to refresh the layer
      layer.redraw(citem);
      return;
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
      updateMarkerLatlng(datalist,idx,lat,lon);
   }
window.console.log("PIXI: HUMHUM..",DATA_count);
   pixiLatlngList= {"uid":uid,"data":datalist} ; 

   return pixiLatlngList;
}

// this is from csm
function makePixiOverlayLayerWithList(uid,latlist,lonlist,vallist,spec) {
    var pixiLatlngList;

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

    pixiLatlngList=_loadup_data_list(uid,latlist,lonlist,vallist);

window.console.log("PIXI:SEG_COUNT " + DATA_SEGMENT_COUNT);
window.console.log("PIXI:DATA_MAX " + DATA_MAX_V);
window.console.log("PIXI:DATA_MIN " + DATA_MIN_V);

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
      updateMarkerLatlng(datalist,idx,lat,lon);
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

    let pixiContainer = new PIXI.Container();
    let pContainers=[]; //particle container
    let segments=[];

    let segment_label_list=getSegmentRangeList(DATA_SEGMENT_COUNT, DATA_MAX_V, DATA_MIN_V);
    let segment_color_list=getSegmentMarkerColorList();

    for(var i=0; i<DATA_SEGMENT_COUNT; i++) {
      var length=getMarkerCount(pixiLatlngList,i);
      var a = new PIXI.ParticleContainer(length, {vertices: true, tint: true});
      // add properties for our patched particleRenderer:
      a.texture = markerTextures[i];
      a.baseTexture = markerTextures[i].baseTexture;
      a.anchor = {x: 0.5, y: 0.5};
      a.visible = 1;

      a.csm_properties = { segment_name:"segment_"+i,
	                   segment_cnt:length,
	                   segment_label: segment_label_list[i],
                           segment_color: segment_color_list[i]};	     

      pixiContainer.addChild(a);
      pContainers.push(a);
    }

    var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    var overlay=L.pixiOverlay(function(utils, event) {

window.console.log("PIXI:event type --- ", event.type);

if(event.type == "undefined") {
    window.console.log(" ???? XXX why is event type of undefined ???");
}

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

        if (_foundOverlay(uid)) { // only add it first time
          return;
        }

        let mapcenter=viewermap.getCenter();
        let mapzoom=viewermap.getZoom();

        var origin = pixi_project([mapcenter['lat'], mapcenter['lng']]);

        let scaleFactor=16; // default came from seismicity
        if(spec.scale_hint == 2 ) { // when grid points are about 2km len is 70k
          scaleFactor=7.2;
        }
        if(spec.scale_hint == 5) {  // when grid points are about 5km
          scaleFactor=3; 
        }

window.console.log("PIXI: scale_hint", spec.scale_hint);
window.console.log("PIXI: using scale factor",scaleFactor);

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
window.console.log("PIXI: group ",i," len is ",len);
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

              var marker = new PIXI.Sprite(markerTextures[i]);
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

      renderer.render(container,{ antialias: true, resolution:2 });
    }, pixiContainer, {
      doubleBuffering: doubleBuffering,
      destroyInteractionManager: true
    }).addTo(viewermap);

    let t=pixiOverlayList.push({"uid":uid,"visible":1,"segment":segments,"overlay":overlay,"top":pixiContainer,"inner":pContainers,"latlnglist":pixiLatlngList});

window.console.log(">>> PIXI..adding into poxiOverlayList with uid of:",uid);
window.console.log(">>> PIXI..size:",pixiOverlayList.length);

    return (pixiOverlayList.length-1);
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

function pixiFindSegmentsWithPixiGid(pixigid) {
    let pixi=pixiFindPixiWithPixiGid(pixigid);
    if(pixi) return pixi.segment;
    return null;
}

function pixiFindOverlayWithPixiGid(pixigid) {
    let pixi=pixiFindPixiWithPixiGid(pixigid);
    if(pixi) return pixi.overlay;
    return null;
}

function pixiFindOverlayWithUid(uid) {
  for(let i=0; i<pixiOverlayList.length; i++) {
     let pixi=pixiOverlayList[i];
     if(pixi.uid == uid) {
       return pixi.overlay;
     }
  }
  return null;
}

function pixiFindPixiWithPixiGid(pixigid) {
    if(pixigid >= pixiOverlayList.length) {
      return null;
    }
    let pixi=pixiOverlayList[pixigid];
    return pixi;
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

function pixiClearPixiOverlay(pixigid) {
    let pixi=pixiOverlayList[pixigid];
    if(pixi && pixi.visible == 1) {
       let layer=pixi.overlay;
       viewermap.removeLayer(layer);
       pixi.visible=0;
window.console.log("PIXI: clear One..pixigid=",pixigid);
    }
}

function pixiClearAllPixiOverlay() {
  let cnt=pixiOverlayList.length;
window.console.log("HERE.. clear All..", cnt);
  for(let i=0; i<cnt; i++) {
    let pixi=pixiOverlayList[i];
    if(pixi.visible == 1) {
       let layer=pixi.overlay;
       viewermap.removeLayer(layer);
       pixi.visible=0;
window.console.log("PIXI: clear All..pixigid=",i);
    }
  }
}

function pixiTogglePixiOverlay(pixigid) {
    let pixi=pixiOverlayList[pixigid];
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

function togglePixiOverlayWithUid(uid) {
window.console.log("PIXI: which uid to toggle PixiOverlay out..",uid);
  for(let i=0; i<pixiOverlayList.length; i++) {
     let pixi=pixiOverlayList[i];
     if(pixi.uid == uid) {
       let v=pixi.visible;
       let layer=pixi.overlay;
       if(v==1) {
         pixi.visible=0;
         viewermap.removeLayer(layer);
         } else {
           viewermap.addLayer(layer);
           pixi.visible=1;
       }
       return;
     }
  }
}

