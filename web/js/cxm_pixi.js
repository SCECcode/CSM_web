/***
   cxm_pixi.js
***/

try {
    var isFileSaverSupported = !!new Blob;
} catch (e) {
    window.console.log("FileSaver is not working!!!");
    abort();
}

/* marker's resizing size's zoom threshold */
var vs_zoom_threshold=5;

// pixi, Leafle.overlayLayer.js
/* data sections, to matching marker name markerN_icon.png */
const DATA_SEGMENT_COUNT= 20; // 0 to 19 -- to matching marker names

var DATA_max_v=null;
var DATA_min_v=null;
var DATA_count=0;

/********************************************/
/* a place to park all the pixiOverlay from the session */
/* [ {"gid":gid, "vis":true, "layer": overlay,         */
/*    "top":pixiContainer,"inner":[ {"container":c0, "vis":1 }, ...]} ] */
var pixiOverlayList=[];

/* PixiOverlayLayer */
var pixiLayer = null;

/* expose pixiOverlay's util to global scope */
var pixi_project=null;

/* textures in a marker container                         */
/* [ markerTexture0, markerTexture1,... markerTexture19 ] */
var markerTextures=[];

var loadOnce=1;

function initMarkerTextures(resources) {
    markerTextures.push(resources.marker1.texture);
    markerTextures.push(resources.marker2.texture);
    markerTextures.push(resources.marker3.texture);
    markerTextures.push(resources.marker4.texture);
    markerTextures.push(resources.marker5.texture);
    markerTextures.push(resources.marker6.texture);
    markerTextures.push(resources.marker7.texture);
    markerTextures.push(resources.marker8.texture);
    markerTextures.push(resources.marker9.texture);
    markerTextures.push(resources.marker10.texture);
    markerTextures.push(resources.marker11.texture);
    markerTextures.push(resources.marker12.texture);
    markerTextures.push(resources.marker13.texture);
    markerTextures.push(resources.marker14.texture);
    markerTextures.push(resources.marker15.texture);
    markerTextures.push(resources.marker16.texture);
    markerTextures.push(resources.marker17.texture);
    markerTextures.push(resources.marker18.texture);
    markerTextures.push(resources.marker19.texture);
    markerTextures.push(resources.marker20.texture);
}

function printMarkerLatlngInfo(plist) {
  let sum=0;
  window.console.log("For: "+plist.gid);
  for(let i=0; i<DATA_SEGMENT_COUNT; i++) {
    let dlist=plist[i];
    sum=sum+data.length;
    window.console.log("    i: "+i+" count: "+ dlist.length);
  }
  window.console.log("  sum up :"+sum);
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
function init_pixi(loader) {
  pixiOverlayList=[];

  loader
    .add('marker1', 'img/marker1_icon.png')
    .add('marker2', 'img/marker2_icon.png')
    .add('marker3', 'img/marker3_icon.png')
    .add('marker4', 'img/marker4_icon.png')
    .add('marker5', 'img/marker5_icon.png')
    .add('marker6', 'img/marker6_icon.png')
    .add('marker7', 'img/marker7_icon.png')
    .add('marker8', 'img/marker8_icon.png')
    .add('marker9', 'img/marker9_icon.png')
    .add('marker10', 'img/marker10_icon.png')
    .add('marker11', 'img/marker11_icon.png')
    .add('marker12', 'img/marker12_icon.png')
    .add('marker13', 'img/marker13_icon.png')
    .add('marker14', 'img/marker14_icon.png')
    .add('marker15', 'img/marker15_icon.png')
    .add('marker16', 'img/marker16_icon.png')
    .add('marker17', 'img/marker17_icon.png')
    .add('marker18', 'img/marker18_icon.png')
    .add('marker19', 'img/marker19_icon.png')
    .add('marker20', 'img/marker20_icon.png');
}

function setup_pixi() {
  // this is used to simulate leaflet zoom animation timing:
  let loader = new PIXI.loaders.Loader();

  if(loadOnce) {
    init_pixi(loader);
  }

  loader.load(function(loader, resources) {
      if(loadOnce) {
        initMarkerTextures(resources);
        loadOnce=0;
      }
  })
  return loader;
}

function makeOnePixiLayer(gid,file) {

  let pixiLayer = makePixiOverlayLayer(gid,file);
  let ticker = new PIXI.ticker.Ticker();

  ticker.add(function(delta) { 
    pixiLayer.redraw({type: 'redraw', delta: delta});
  });

  viewermap.on('changestart', function() { ticker.start(); });
  viewermap.on('changeend', function() { ticker.stop(); });
  viewermap.on('zoomstart', function() { ticker.start(); });
  viewermap.on('zoomend', function() { ticker.stop(); });
  viewermap.on('zoomanim', pixiLayer.redraw, pixiLayer);

  return {"pixiLayer":pixiLayer,"max_v":DATA_max_v,"min_v":DATA_min_v,"count_v":DATA_count };
}

// toggle off a child container from an overlay layer
function toggleMarkerContainer(pixi,target_segment) {
  var plist=pixi['inner'];
  var top=pixi['top'];
  if(pixi["vis"]==false) {
    windown.console.log("layer not visible To TOGGLE!!\n");
    return;
  } 
  var clist=pixi['inner'];
  var top=pixi['top'];
  for(var j=0; j<DATA_SEGMENT_COUNT; j++) {
    var citem=clist[j];
    var cptr=citem["container"];
    if(cptr == target_segment) {
      if(citem["vis"]) { // toggle off
        citem["vis"]=0;
        top.removeChild(cptr);
        } else {
          citem["vis"]=1;
          top.addChild(cptr);
      }
      return;
    }
  }
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
   DATA_max_v = data_max_v;
   DATA_min_v = data_min_v;

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
      let idx=getRangeIdx(val, DATA_max_v, DATA_min_v);
      updateMarkerLatlng(datalist,idx,lat,lon);
   }
window.console.log("HUMHUM..",DATA_count);
   pixiLatlngList= {"gid":gid,"data":datalist} ; 

   return [DATA_count, pixiLatlngList];
}

// this is from csm
function makePixiOverlayLayerWithList(gid,latlist,lonlist,vallist) {
    var pixiLatlngList;
    var count;	 
    [count, pixiLatlngList]=_loadup_data_list(gid,latlist,lonlist,vallist);
    return makePixiOverlayLayer(gid,pixiLatlngList,count);
}

// order everything into a sorted array
// break up data into buckets (one per segment)
// input : lon lat vel
// returns :
//    {"gid":gid,"data":[ [{"lat":lat,"lng":lng},...], ...] }
function _loadup_data_url(gid,url) {

   DATA_max_v=null;
   DATA_min_v=null;
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
         window.console.log("invalid data in this line "+i+" >>"+token.length);
         
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
      if(DATA_max_v == null) {
          DATA_max_v = vel;
	  DATA_min_v = vel;  
          } else {
              if(vel > DATA_max_v)
                DATA_max_v=vel;
              if(vel < DATA_min_v)
                DATA_min_v=vel;
      }
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
      let idx=getRangeIdx(vel, DATA_max_v, DATA_min_v);
      updateMarkerLatlng(datalist,idx,lat,lon);
   }
   pixiLatlngList= {"gid":gid,"data":datalist} ; 

   window.console.log("FILE:"+url+" total data:"+DATA_count+"("+DATA_min_v+","+DATA_max_v+")");
   return pixiLatlngList;
}

// this is from cgm
function makePixiOverlayLayerWithFile(gid,file) {
    var pixiLatlngList=_loadup_data_url(gid,file)
    return makePixiOverlayLayer(gid,pixiLatlngList,0);
}

function makePixiOverlayLayer(gid,pixiLatlngList,hint) {

    let zoomChangeTs = null;

    let pixiContainer = new PIXI.Container();
    let pContainers=[]; //particle container

    for(var i=0; i<DATA_SEGMENT_COUNT; i++) {
      var length=getMarkerCount(pixiLatlngList,i);
//XXX,  new PIXI.particles.ParticleContainer(maxSize, properties, batchSize)
      var a = new PIXI.particles.ParticleContainer(length, {vertices: true, tint: true});
      // add properties for our patched particleRenderer:
window.console.log("HERE at container..");
      a.texture = markerTextures[i];
      a.baseTexture = markerTextures[i].baseTexture;
      a.anchor = {x: 0.5, y: 0.5};

      pixiContainer.addChild(a);
      pContainers.push(a);
    }

    var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var initialScale;

    var overlay=L.pixiOverlay(function(utils, event) {
      var zoom = utils.getMap().getZoom();
      var container = utils.getContainer();
      var renderer = utils.getRenderer();
      pixi_project = utils.latLngToLayerPoint;
      var getScale = utils.getScale;
      var invScale = 1 / getScale();

window.console.log("HERE at event");
window.console.log("in L.pixiOverlay layer, auto zoom at "+zoom+" scale at>"+getScale()+" invScale"+invScale);

      if (event.type === 'add') {

// only add it first time
        if (foundOverlay(gid)) {
          return;
        }

        let mapcenter=viewermap.getCenter();
        let mapzoom=viewermap.getZoom();

        var origin = pixi_project([mapcenter['lat'], mapcenter['lng']]);
        initialScale = invScale/16; 
// initial size of the marker for 70k pts
	if(hint != 0) { // THIS IS A HACK...
          initialScale = invScale/7; 
// for 10k pts
          if(hint < 20000)
             initialScale = invScale/3; 
        }
// for circles       initialScale = invScale/20; 

        // fill in the particles
        let len_sum=0;
        for(var i=0; i< DATA_SEGMENT_COUNT; i++ ) {
           var a=pContainers[i];
           a.x = origin.x;
           a.y = origin.y;
           a.localScale = initialScale;

           var latlngs=getMarkerLatlngs(pixiLatlngList,i);
           var len=latlngs.length;
           len_sum=len_sum+len;
           for (var j = 0; j < len; j++) {
              var latlng=latlngs[j];
              var ll=latlng['lat'];
              var gg=latlng['lng'];
//window.console.log("start latlon>>"+ll+" "+gg);
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
//window.console.log( "      adding  child at..("+latlng['lat']+')('+latlng['lng']+')');
           }
        }
window.console.log("HERE total of len, ",len_sum); 
     }

      // change size of the marker after zoomin and zoomout
window.console.log("event type", event.type);

     if (event.type === 'zoomanim') {
        var targetZoom = event.zoom;
window.console.log("in zoomaim.., threshold", vs_zoom_threshold);
window.console.log("in zoomaim.., targetZoom", targetZoom);
window.console.log("in zoomaim.., zoom", zoom);
        if (targetZoom >= vs_zoom_threshold || zoom >= vs_zoom_threshold) {
          zoomChangeTs = 0;
          var targetScale = targetZoom >= vs_zoom_threshold ? (1 / getScale(event.zoom))/10  : initialScale;

window.console.log(" ZOOManim.. new targetScale "+targetScale);

          pContainers.forEach(function(innerContainer) {
            innerContainer.currentScale = innerContainer.localScale;
            innerContainer.targetScale = targetScale;
          });
        }
        return null;
      }

      if (event.type === 'redraw') {
        var easing = BezierEasing(0, 0, 0.25, 1);
        var delta = event.delta;
        if (zoomChangeTs !== null) {
          var duration = 5; // 17
          zoomChangeTs += delta;
          var lambda = zoomChangeTs / duration;
          if (lambda > 1) {
            lambda = 1;
            zoomChangeTs = null;
          }
          lambda = easing(lambda);
          pContainers.forEach(function(innerContainer) {
            innerContainer.localScale = innerContainer.currentScale + lambda * (innerContainer.targetScale - innerContainer.currentScale);
          });
        } else { return null;}
      }

      renderer.render(container);
    }, pixiContainer, {
      doubleBuffering: doubleBuffering,
      destroyInteractionManager: true
    }).addTo(viewermap);

    pixiOverlayList.push({"gid":gid,"vis":1,"overlay":overlay,"top":pixiContainer,"inner":pContainers,"latlnglist":pixiLatlngList});

    return overlay;
}

function foundOverlay(gid) {
  for(let i=0; i<pixiOverlayList.length; i++) {
     let pixi=pixiOverlayList[i];
     if(pixi["gid"] == gid) {
       return 1;
     }
  }
  return 0;
}

function clearAllPixiOverlay() {
  pixiOverlayList.forEach(function(pixi) {
    if(pixi !=null || pixi.length !=0) {
      if(pixi["vis"]==1) {
        var layer=pixi["overlay"];
        viewermap.removeLayer(layer);
        pixi["vis"]=0;
      }
    }
  });
}

function togglePixiOverlay(gid) {
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
