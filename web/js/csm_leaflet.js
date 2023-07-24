/***
   csm_leaflet.js

This is leaflet specific utilities for CSM
***/

var init_map_zoom_level = 6.75;
var init_map_coordinates =  [34.0, -118.2];
var drawing_rectangle = false;

var default_color = "black";
var default_highlight_color = "rgb(0,0,255)";
var default_weight = 2;
var default_highlight_weight = 4;

var original_style = {
    'color': default_color,
    'opacity':0.5,
    'fill-opacity':0.1,
    'weight': default_weight,
};

var highlight_style = {
    'color': default_highlight_color,
    'opacity':1,
    'weight': default_highlight_weight,
};

//var scecAttribution ='<a href="https://www.scec.org">SCEC</a><button id="bigMapBtn" class="btn cxm-small-btn" title="Expand into a larger map" style="color:black;padding: 0rem 0rem 0rem 0.5rem" onclick="toggleBigMap()"><span class="fas fa-expand"></span></button>';
var scecAttribution ='<a href="https://www.scec.org">SCEC</a>';


var rectangle_options = {
       showArea: false,
         shapeOptions: {
              stroke: true,
              color: default_color,
              weight: default_weight,
              opacity: 0.5,
              fill: false,
              fillColor: null, //same as color by default
              fillOpacity: 0.1,
              clickable: false
         }
};

var rectangleDrawer;
var mymap, baseLayers, layerControl, currentLayer;
var mainLegend;

// track rectangles, 
// limit number to be keep at a time
//var tmp={"layer":layer, "gid": gid,  "valid":1, "latlngs":[{"lat":a,"lon":b},{"lat":c,"lon":d}]};
var csm_region_latlngs=null; // just 1 region at a time
var csm_latlon_area_list=[]; // all layers that is associated with the same latlngs
var track_csm_latlon_area_gid=0;

// track all marker, never remove
var csm_latlon_point_list=[];

/*****************************************************************/

function clear_popup()
{
  viewermap.closePopup();
}

function resize_map()
{
  viewermap.invalidateSize();
}

function refresh_map()
{
  if (viewermap == undefined) {
    window.console.log("refresh_map: BAD BAD BAD");
    } else {
      window.console.log("refresh_map: calling setView");
      viewermap.setView( init_map_coordinates, init_map_zoom_level);
  }
}

function set_map(center,zoom)
{
  if (viewermap == undefined) {
    window.console.log("set_map: BAD BAD BAD");
    } else {
      window.console.log("set_map: calling setView");
      viewermap.setView(center, zoom);
  }
}

function get_bounds()
{
   var bounds=viewermap.getBounds();
   return bounds;
}

function get_map()
{
  var center=init_map_coordinates;
  var zoom=init_map_zoom_level;

  if (viewermap == undefined) {
    window.console.log("get_map: BAD BAD BAD");
    } else {
      center=viewermap.getCenter();
      zoom=viewermap.getZoom();
  }
  return [center, zoom];
}

function setup_viewer()
{
// esri
	
  // web@scec.org  - ArcGIS apiKey, https://leaflet-extras.github.io/leaflet-providers/preview/
  var esri_apiKey = "AAPK2ee0c01ab6d24308b9e833c6b6752e69Vo4_5Uhi_bMaLmlYedIB7N-3yuFv-QBkdyjXZZridaef1A823FMPeLXqVJ-ePKNy";
  var esri_topographic = L.esri.Vector.vectorBasemapLayer("ArcGIS:Topographic", {apikey: esri_apiKey});
  var esri_imagery = L.esri.Vector.vectorBasemapLayer("ArcGIS:Imagery", {apikey: esri_apiKey});
  var osm_streets_relief= L.esri.Vector.vectorBasemapLayer("OSM:StreetsRelief", {apikey: esri_apiKey});
  var esri_terrain = L.esri.Vector.vectorBasemapLayer("ArcGIS:Terrain", {apikey: esri_apiKey});

//  var esri_topographic = L.esri.basemapLayer("Topographic");
//  var esri_imagery = L.esri.basemapLayer("Imagery");
//var esri_ng = L.esri.basemapLayer("NationalGeographic");
//var shaded_relief =  L.esri.basemapLayer("ShadedRelief");

// otm topo
  var topoURL='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
  var topoAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreeMap</a> contributors,<a href=http://viewfinderpanoramas.org"> SRTM</a> | &copy; <a href="https://www.opentopomap.org/copyright">OpenTopoMap</a>(CC-BY-SA)';
  L.tileLayer(topoURL, { detectRetina: true, attribution: topoAttribution, maxZoom:18 })

  var otm_topographic = L.tileLayer(topoURL, { detectRetina: true, attribution: topoAttribution, maxZoom:18});

  var jawg_dark = L.tileLayer('https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
	attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	minZoom: 0,
	maxZoom: 18,
	accessToken: 'hv01XLPeyXg9OUGzUzaH4R0yA108K1Y4MWmkxidYRe5ThWqv2ZSJbADyrhCZtE4l'});

  var jawg_light = L.tileLayer('https://{s}.tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
	attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	minZoom: 0,
	maxZoom: 18,
	accessToken: 'hv01XLPeyXg9OUGzUzaH4R0yA108K1Y4MWmkxidYRe5ThWqv2ZSJbADyrhCZtE4l' });

// osm street
  var openURL='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var openAttribution ='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  var osm_street=L.tileLayer(openURL, {attribution: openAttribution, maxZoom:18});

  baseLayers = {
    "esri topo" : esri_topographic,
    "esri imagery" : esri_imagery,
    "jawg light" : jawg_light,
    "jawg dark" : jawg_dark,
    "osm streets relief" : osm_streets_relief,
    "otm topo": otm_topographic,
    "osm street" : osm_street,
    "esri terrain": esri_terrain
  };

  var overLayer = {};
  var basemap = L.layerGroup();
  currentLayer = esri_topographic;


// ==> mymap <==
// mymap = L.map('CSM_plot', { zoomSnap: 0.25, drawControl:false, layers: [esri_topographic, basemap], zoomControl:true} );
  mymap = L.map('CSM_plot', { zoomSnap: 0.25, drawControl:false, zoomControl:true} );

  mymap.setView(init_map_coordinates, init_map_zoom_level);
  mymap.attributionControl.addAttribution(scecAttribution);

  esri_topographic.addTo(mymap);

// basemap selection
  var ctrl_div=document.getElementById('external_leaflet_control');

// ==> layer control <==
// add and put it in the customized place
//  L.control.layers(baseLayers, overLayer).addTo(mymap);
  layerControl = L.control.layers(baseLayers, overLayer,{collapsed: true });
  layerControl.addTo(mymap);
  var elem= layerControl._container;
  elem.parentNode.removeChild(elem);

  ctrl_div.appendChild(layerControl.onAdd(mymap));
  // add a label to the leaflet-control-layers-list
  var forms_div=document.getElementsByClassName('leaflet-control-layers-list');
  var parent_div=forms_div[0].parentElement;
  var span = document.createElement('span');
  span.style="font-size:14px;font-weight:bold;";
  span.className="leaflet-control-layers-label";
  span.innerHTML = 'Select background';
  parent_div.insertBefore(span, forms_div[0]);

// ==> scalebar <==
  L.control.scale({metric: 'false', imperial:'false', position: 'bottomleft'}).addTo(mymap);

// ==> mouse location popup <==
//   var popup = L.popup();
// function onMapClick(e) {
//   if(!skipPopup) { // suppress if in latlon search ..
//     popup
//       .setLatLng(e.latlng)
//       .setContent("You clicked the map at " + e.latlng.toString())
//       .openOn(mymap);
//   }
// }
// mymap.on('click', onMapClick);

  function onMapMouseOver(e) {
    if(CSM.toDraw()) {
      drawRectangle();
    }
  }

  function onMapZoom(e) { 
    var zoom=mymap.getZoom();
//window.console.log("MAP got zoomed..>>",zoom);
    updateCSMBoreholes(mymap);
  }

  mymap.on('mouseover', onMapMouseOver);
  mymap.on('zoomend dragend', onMapZoom);

// ==> rectangle drawing control <==
  rectangleDrawer = new L.Draw.Rectangle(mymap, rectangle_options);
  mymap.on(L.Draw.Event.CREATED, function (e) {
    var type = e.layerType,
        layer = e.layer;
    if (type === 'rectangle') {  // only tracks rectangles
        // get the boundary of the rectangle
        var latlngs=layer.getLatLngs();
        // first one is always the south-west,
        // third one is always the north-east
        var loclist=latlngs[0];
        var sw=loclist[0];
        var ne=loclist[2];
        if(sw['lat'] == ne['lat'] && sw['lng'] == ne['lng']) {
// don't add it, it is a point
          return;
        }
        add_bounding_rectangle_layer(layer,sw['lat'],sw['lng'],ne['lat'],ne['lng']);
        mymap.addLayer(layer);
// TODO: CHECK, the rectangle created on the mapview does not seem to 'confirm'
// like hand inputed rectangle. Maybe some property needs to be set
// For now, just redraw the rectangle
        CSM.searchLatlon(1,latlngs);        
    }
  });

// enable the expand view key
$("#CSM_plot").prepend($("#expand-view-key-container").html());
let tmp=$(".leaflet-control-attribution");
// should  only have 1, adjust the attribution's location
let v= document.getElementsByClassName("leaflet-control-attribution")[0];
v.style.right="1.5rem";
v.style.height="1.4rem";


// finally,
  return mymap;
}

function drawRectangle(){
  rectangleDrawer.enable();
}
function skipRectangle(){
  rectangleDrawer.disable();
}

// ==> feature popup on each layer <==
function popupDetails(layer) {
   layer.openPopup(layer);
}

function closeDetails(layer) {
   layer.closePopup();
}

// https://gis.stackexchange.com/questions/148554/disable-feature-popup-when-creating-new-simple-marker
function unbindPopupEachFeature(layer) {
    layer.unbindPopup();
    layer.off('click');
}

// binding the 'detail' fault content
function bindPopupEachFeature(feature, layer) {
    var popupContent="";
    layer.on({
        mouseover: function(e) {
          layer.setStyle({weight: default_highlight_weight});
          if (feature.properties != undefined) {
            popupContent = "wowow";
          }
          layer.bindPopup(popupContent);
        },
        mouseout: function(e) {
          layer.setStyle({weight: default_weight});
        },
        click: function(e) {
          if (feature.properties != undefined) {
            popupContent = feature.properties.name;
          }
          layer.bindPopup(popupContent);
        },
    });

}

function addRectangleLayer(latA,lonA,latB,lonB) {
  var bounds = [[latA, lonA], [latB, lonB]];
  var layer=L.rectangle(bounds).addTo(viewermap);
  layer.setStyle(original_style);
  return layer;
}

// make it without adding to map
function makeRectangleLayer(latA,lonA,latB,lonB) {
  var bounds = [[latA, lonA], [latB, lonB]];
  var layer=L.rectangle(bounds);
  return layer;
}

function makeLeafletIconMarker(bounds,cname,size) {
  var myIcon = L.divIcon({className:cname});
  var myOptions = { icon : myIcon};

  var layer = L.marker(bounds, myOptions);
  var icon = layer.options.icon;
  var opt=icon.options;
  icon.options.iconSize = [size,size];
  layer.setIcon(icon);
  return layer;
}

// icon size 8 
function addIconMarkerLayerGroup(latlngs,description,sz) {
  var cnt=latlngs.length;
  if(cnt < 1)
    return null;
  var markers=[];
  for(var i=0;i<cnt;i++) {
     var latlng = latlngs[i];
     var desc = description[i];
     var cname="quake-color-historical default-point-icon";
     var marker=makeLeafletIconMarker(latlng,cname,sz);
     marker.bindTooltip(desc);
     markers.push(marker);
  }
  var group = new L.FeatureGroup(markers);
  return group;
}

// TODO: make this a layer with sticks azimuth calculation
//       and add mouse in/mouse out and focusing event
//       and also zoom in and zoom out pixiel calc
function makeLeafletCircleMarker(latlng,color) {
  let zoom=mymap.getZoom();
  let sz=2;
  if(zoom <= 7) sz=1;
  if(zoom >= 9) sz=3;

  let marker = L.circleMarker(latlng,
        {
            color: "black",
            fillColor: color,
            fillOpacity: 1,
            radius: sz,
            riseOnHover: true,
            weight: 1,
        });
  marker.on({
    mouseover: function(e) {
      marker.setRadius(sz*5);
    },
    mouseout: function(e) {
      marker.setRadius(sz);
    },
  });
  return marker;
}

function makeLeafletPolyline(latlngs) {
  let zoom=viewermap.getZoom();
  let weight=1;
  if(zoom > 8) weight=2;

  let line = L.polyline(latlngs, 
	    { color: "black",
              weight: weight});		       

  return line;
}

function addCircleMarkerLayerGroup(latlngs,description,colors=[]) {
  var cnt=latlngs.length;
  if(cnt < 1)
    return null;
  var markers=[];
  for(var i=0;i<cnt;i++) {
     var latlng = latlngs[i];
     var desc = description[i];
     var color="black";
     if(colors.length != 0) {
       color=colors[i];
     }
     var marker=makeLeafletCircleMarker(latlng,color);
     marker.bindTooltip(desc);
     markers.push(marker);
  }
  var group = new L.FeatureGroup(markers);
  return group;
}

// ends {"id":v, "ends": latlng }
//
function addPolylineLayerGroup(sets) {
  var cnt=sets.length;
  if(cnt < 1)
    return null;
  var lines=[];
  for(var i=0;i<cnt;i++) {
     let term=sets[i];
     var latlngs = term["ends"];
     var line=makeLeafletPolyline(latlngs);
     lines.push(line);
  }
  var group = new L.FeatureGroup(lines);
  return group;
}


function switchLayer(layerString) {
    mymap.removeLayer(currentLayer);
    mymap.addLayer(baseLayers[layerString]);
    currentLayer = baseLayers[layerString];

}

/****************************** from a list ****************/
// input from the key-in
function add_bounding_rectangle(a,b,c,d) {
  var layer=addRectangleLayer(a,b,c,d);
  let gid=getRnd();

  window.console.log("add_bounding_rectangle..",gid);
  layer.on({
    mouseover: function(e) {
      layer.setStyle({color:default_highlight_color, weight: default_highlight_weight});
      CSM.highlight_metadata_row(gid);
    },
    mouseout: function(e) {
      layer.setStyle({color:default_color, weight: default_weight});
      CSM.unhighlight_metadata_row(gid);
    },
  });
  let nlatlngs=[{"lat":a,"lon":b},{"lat":c,"lon":d}];
  var tmp={"layer":layer, "gid":gid, "valid":1, "latlngs":nlatlngs};

// ??? NOT SURE
  if(csm_region_latlngs != null ) {
    if(sameLatlngs(csm_region_latlngs, nlatlngs)) { // same
      csm_latlon_area_list.push(tmp);
      track_csm_latlon_area_gid=gid;
      } else { // remove all
        CSM.unselectAllRegion();
        csm_latlon_area_list=[ tmp ];
        track_csm_latlon_area_gid=gid;
        csm_region_latlngs = nlatlngs;
    }
    } else {
      csm_latlon_area_list.push(tmp);
      track_csm_latlon_area_gid=gid;
      csm_region_latlngs = nlatlngs;
  }
  return layer;
}

function get_bounding_rectangle_layer_gid() {
  return track_csm_latlon_area_gid;
}


// idx starts from 1
function remove_bounding_rectangle_layer(gid) {
window.console.log("remove rectangle layer one");
   let len=csm_latlon_area_list.length;
   for(let i=0; i<len; i++) {
     let tmp=csm_latlon_area_list[i];
     if(tmp.gid == gid && tmp.valid == 1) {
        let layer=tmp.layer;
        viewermap.removeLayer(layer);
        tmp.valid=0;
// remove tmp from the list
        csm_latlon_area_list.splice(i,1);
// window.console.log("remove a bounding rectangle", gid);
        if(csm_latlon_area_list.length == 0) {
          track_csm_latlon_area_gid=0;
          csm_region_latlngs = null;
        }		 
        return;
     }
   }
}

// idx is a string
function highlight_bounding_rectangle_layer(gid) {
window.console.log("highlight rectangle layer one");
   let len=csm_latlon_area_list.length;
   for(let i=0; i<len; i++) {
     let tmp=csm_latlon_area_list[i];
     if(tmp.gid == gid && tmp.valid == 1) {
        let layer=tmp.layer;
        layer.setStyle({color: highlight_style.color});
        return;
     }
   }
}

function unhighlight_bounding_rectangle_layer(gid) {
window.console.log("unhighlight rectangle layer one");
   let len=csm_latlon_area_list.length;
   for(let i=0; i<len; i++) {
     let tmp=csm_latlon_area_list[i];
     if(tmp.gid == gid && tmp.valid == 1) {
        let layer=tmp.layer;
        layer.setStyle({color: original_style.color});
        return;
     }
   }
}

function remove_all_bounding_rectangle_layer() {
   if(csm_region_latlngs != null ) {
     CSM.unselectAllRegion();
     csm_latlon_area_list=[];
     track_csm_latlon_area_gid=0;
     csm_region_latlngs = null;
   }
}

// input from the map
function add_bounding_rectangle_layer(layer, a,b,c,d) {
window.console.log("add_bounding_rectangle_layer..");
  let gid=getRnd();
  layer.on({
      mouseover: function(e) {
        layer.setStyle({color:default_highlight_color, weight: default_highlight_weight});
        CSM.highlight_metadata_row(gid);
      },
      mouseout: function(e) {
        layer.setStyle({color:default_color, weight: default_weight});
        CSM.unhighlight_metadata_row(gid);
      },
      click: function(e) {
        let popupContent = "id="+gid;
        layer.bindPopup(popupContent);
      }
  });
window.console.log("IN adding from map..");
  let aa=parseFloat(a.toFixed(5));
  let bb=parseFloat(b.toFixed(5));
  let cc=parseFloat(c.toFixed(5));
  let dd=parseFloat(d.toFixed(5));

  let nlatlngs=[{"lat":aa,"lon":bb},{"lat":cc,"lon":dd}];
  var tmp={"layer":layer, "gid":gid, "valid":1, "latlngs":nlatlngs};

// NOT SURE
  if(csm_region_latlngs != null ) {
    if(sameLatlngs(csm_region_latlngs, nlatlngs)) { // same
      csm_latlon_area_list.push(tmp);
      track_csm_latlon_area_gid=gid;
      } else { // remove all
        CSM.unselectAllRegion();
        csm_latlon_area_list=[ tmp ];
        track_csm_latlon_area_gid=gid;
        csm_region_latlngs = nlatlngs;
    } 
    } else {
      csm_latlon_area_list.push(tmp);
      track_csm_latlon_area_gid=gid;
      csm_region_latlngs = nlatlngs;
  }
  return layer;
}

function add_marker_point(a,b) {
  // remove old one and add a new one
  remove_marker_point_layer();
  var layer=addMarkerLayer(a,b);
  var tmp={"layer":layer, "latlngs":[{"lat":a,"lon":b}]};
  csm_latlon_point_list.push(tmp);
  return layer;
}

function remove_marker_point_layer() {
   if(csm_latlon_point_list.length == 1) {
     var point=csm_latlon_point_list.pop();
     var l=point["layer"];
     viewermap.removeLayer(l);
   }
}

function add_marker_point_layer(layer, a,b) {
  // remove old one and add a new one
  remove_marker_point_layer();
  var tmp={"layer":layer, "latlngs":[{"lat":a,"lon":b}]};
  csm_latlon_point_list.push(tmp);
}


// see if layer is contained in the layerGroup
function containsLayer(layergroup,layer) {
    let target=layergroup.getLayerId(layer);
    let layers=layergroup.getLayers();
    for(var i=0; i<layers.length; i++) {
      let id=layergroup.getLayerId(layers[i]);
      if(id == target) {
        return 1;
      }
    }
    return 0;
}
