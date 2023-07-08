/***
   csm_leaflet.js

This is leaflet specific utilities for CSM
***/

var init_map_zoom_level = 7;
var init_map_coordinates =  [34.0, -118.2];
var drawing_rectangle = false;

var default_color = "red";
var default_highlight_color = "blue";
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
              fill: true,
              fillColor: null, //same as color by default
              fillOpacity: 0.1,
              clickable: false
         }
};

var rectangleDrawer;
var mymap, baseLayers, layerControl, currentLayer;
var seismicityLegend;
var mainLegend;

// track all rectangles, never remove
// valid: 1 is visible, 0 is not(already got removed)
//var tmp={"layer":layer, "gid": gid,  "valid":1, "latlngs":[{"lat":a,"lon":b},{"lat":c,"lon":d}]};
var csm_latlon_area_list=[];
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
  var esri_topographic = L.esri.basemapLayer("Topographic");
  var esri_imagery = L.esri.basemapLayer("Imagery");
  var esri_ng = L.esri.basemapLayer("NationalGeographic");

// otm topo
  var topoURL='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
  var topoAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreeMap</a> contributors,<a href=http://viewfinderpanoramas.org"> SRTM</a> | &copy; <a href="https://www.opentopomap.org/copyright">OpenTopoMap</a>(CC-BY-SA)';
  L.tileLayer(topoURL, { detectRetina: true, attribution: topoAttribution, maxZoom:18 })

  var otm_topographic = L.tileLayer(topoURL, { detectRetina: true, attribution: topoAttribution, maxZoom:18});

// osm street
  var openURL='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var openAttribution ='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  var osm_street=L.tileLayer(openURL, {attribution: openAttribution, maxZoom:18});
  var shaded_relief =  L.esri.basemapLayer("ShadedRelief");

  baseLayers = {
    "esri topo" : esri_topographic,
    "esri NG" : esri_ng,
    "esri imagery" : esri_imagery,
    "otm topo": otm_topographic,
    "osm street" : osm_street,
    "shaded relief": shaded_relief
  };
  var overLayer = {};
  var basemap = L.layerGroup();
  currentLayer = esri_topographic;


// ==> mymap <==
  mymap = L.map('CSM_plot', { drawControl:false, layers: [esri_topographic, basemap], zoomControl:true} );
  mymap.setView(init_map_coordinates, init_map_zoom_level);
  mymap.attributionControl.addAttribution(scecAttribution);

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

// ==> model legend <==
//  var mainLegend = document.querySelector('div.legend');
//  var mainLegendContent = mainLegend.querySelector('.content');

//==> seismicity legend <==
  seismicityLegend=L.control( {position:'bottomleft'});

  seismicityLegend.onAdd = function (map) {
    this._div = L.DomUtil.create('div');
    this.update();
    return this._div;
  };

  seismicityLegend.update = function (props, param=null) {
     if(param == null) {
       this._div.innerHTML="";
       return;
     }
     this._div.innerHTML='<img src="./img/'+param+'" style="width:200px; margin-left:-5px;" >';
  }
  seismicityLegend.addTo(mymap);
  //seismicityLegend.update({}, "cfm-viewer.png");
  //to remove,
  //mymap.removeControl(seismicityLegend);


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
//window.console.log("map got zoomed..>>",zoom);
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

function removeSeismicityLegend() {
  seismicityLegend.update();
}
function showSeismicityLegend(param) {
  seismicityLegend.update({}, param);
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

function makeLeafletMarker(bounds,cname,size) {
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
function addMarkerLayerGroup(latlng,description,sz) {
  var cnt=latlng.length;
  if(cnt < 1)
    return null;
  var markers=[];
  for(var i=0;i<cnt;i++) {
     var bounds = latlng[i];
     var desc = description[i];
     var cname="quake-color-historical default-point-icon";
     var marker=makeLeafletMarker(bounds,cname,sz);
     marker.bindTooltip(desc);
     markers.push(marker);
  }
  var group = new L.FeatureGroup(markers);
  mymap.addLayer(group);
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
// ??? old one	csm_latlon_area_list.length+1;
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
  var tmp={"layer":layer, "gid": gid, "valid":1, "latlngs":[{"lat":a,"lon":b},{"lat":c,"lon":d}]};
  csm_latlon_area_list.push(tmp);
  track_csm_latlon_area_gid=gid;
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

function remove_bounding_rectangle_layer_all() {
window.console.log("remove rectangle layer all");
   let len=csm_latlon_area_list.length;
   for(let i=0; i<len; i++) {
     let tmp=csm_latlon_area_list[0];
     var layer=tmp.layer;
     if(tmp.valid == 1) {
       viewermap.removeLayer(layer);
       tmp.valid=0;
     }
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
  var tmp={"layer":layer, "gid":gid, "valid":1, "latlngs":[{"lat":a,"lon":b},{"lat":c,"lon":d}]};
  
  csm_latlon_area_list.push(tmp);
  track_csm_latlon_area_gid=gid;
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
