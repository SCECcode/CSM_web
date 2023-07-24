
/***
   csm_ui.js

   specific to csm's viewer.php to 
      expand the leaflet map view
      manage the boreholes
      manage the opacity slider
***/

/************************************************************************************/
var big_map=0; // 0,1(some control),2(none)

function _toMedView()
{
let elt = document.getElementById('banner-container');
let celt = document.getElementById('top-intro');
let c_height = elt.clientHeight+(celt.clientHeight/2);
let h=576+c_height;

$('#top-intro').css("display", "none");
$('#CSM_plot').css("height", h);
//$('#metricData').removeClass('col-5').addClass('col-0');
$('#metricData').css("display", "none");
$('#top-map').removeClass('col-7').addClass('row');
$('#top-map').removeClass('pl-1').addClass('pl-0');
$('#mapDataBig').addClass('col-12').removeClass('row');
resize_map();
}

function _toMinView()
{
let height=window.innerHeight;
let width=window.innerWidth;

$('#top-control').css("display", "none");
$('#top-select').css("display", "none");
$('.navbar').css("margin-bottom", "0px");
$('.container').css("max-width", "100%");
$('.container').css("padding-left", "0px");
$('.container').css("padding-right", "0px");
// minus the height of the container top 
let elt = document.getElementById('banner-container');
let c_height = elt.clientHeight;
let h = height - c_height-4.5;
let w = width - 15;
//window.console.log( "height: %d, %d > %d \n",height, c_height,h);
//window.console.log( "width: %d, %d  \n",width, w);
$('#CSM_plot').css("height", h);
$('#CSM_plot').css("width", w);
resize_map();
}

function _toNormalView()
{
$('#top-control').css("display", "");
$('#top-select').css("display", "");
$('#CSM_plot').css("height", "576px");
$('#CSM_plot').css("width", "635px");
$('.navbar').css("margin-bottom", "20px");
$('.container').css("max-width", "1140px");
$('.container').css("padding-left", "15px");
$('.container').css("padding-right", "15px");

$('#top-intro').css("display", "");
//$('#metricData').addClass('col-5').removeClass('col-0');
$('#metricData').css("display","");
$('#top-map').removeClass('row').addClass('col-7');
$('#top-map').removeClass('pl-1').addClass('pl-0');
$('#mapDataBig').removeClass('col-12').addClass('row');
resize_map();
}

function toggleBigMap()
{
  // need to go to Model view if it is in 'Get Data' mode
  $('#searchTypeModel').click();
  switch (big_map)  {
    case 0:
      big_map=1;
      _toMedView();		   
      break;
    case 1:
      big_map=2;
      _toMinView();		   
      break;
    case 2:
      big_map=0;
      _toNormalView();		   
      break;
  }
}

/************************************************************************************/
/*** 
x1=lon-scale/cosd(mean(lat))*sind(SHmax)
x2=lon+scale/cosd(mean(lat))*sind(SHmax)
y1=lat-scale*cosd(SHmax)
y2=lat+scale*cosd(SHmax)

the "mean(lat)" part is just the mean latitude of the dataset, to account for 
units of latitude and longitude not having the same length.  For this dataset,
the mean latitude is 34.2156º, so that cosd(34.2156) = 0.8269.  This will be 
the same for all points in the borehole dataset, so we can just hardwire it in.

the "scale" number is what needs to change depending on how zoomed in the 
viewer is.  If it's just looking at the Los Angeles area, "scale=0.1" is a good 
number, but if we're looking at the whole of southern california, "scale=0.3" 
might be a good number.
***/

var csm_boreholes_layer={};
var csm_boreholes_latlngs=[];
var csm_boreholes_azimuth=[];
var csm_boreholes_id=[];
var csm_boreholes_tips=[];
var csm_boreholes_colors=[];

function downloadBorehole() {
  saveAsURLFile('./csm_data/LuttrellHardebeckJGR2021_Table1.csv');
}

function calc_ends(i,lat_s,lon_s,shmax_s,zoom) {

  let lat=parseFloat(lat_s);
  let lon=parseFloat(lon_s);
  let shmax=parseFloat(shmax_s);
  let ends=[];

  let cosdlat=0.8269;
  let shmax_r = shmax * Math.PI / 180;

  let scale= (0.0013*(zoom * zoom)) - (0.0359 * zoom) + 0.2489;

  let x1=  (lon - (scale / cosdlat * Math.sin(shmax_r)))
  let x2=  (lon + (scale / cosdlat * Math.sin(shmax_r)))
  let y1=  (lat - (scale * Math.cos(shmax_r)));
  let y2=  (lat + (scale * Math.cos(shmax_r)));

  x1 = Math.floor(x1 * 10000)/10000;
  x2 = Math.floor(x2 * 10000)/10000;
  y1 = Math.floor(y1 * 10000)/10000;
  y2 = Math.floor(y2 * 10000)/10000;

  ends.push({"lat":y1,"lon":x1});
  ends.push({"lat":y2,"lon":x2});

/*
  let middle={"lat":lat, "lon":lon};
  let point1=mymap.latLngToContainerPoint(ends[0]);
  let point2=mymap.latLngToContainerPoint(ends[1]);
  let center=mymap.latLngToContainerPoint(middle);

 // let v=mymap.distanceTo(latlngs[0], latlngs[1]);
  let dist1=mymap.distance(ends[0], middle);	
  let dist2=mymap.distance(middle, ends[1]);	
  let dist=mymap.distance(ends[0], ends[1]);	

used on excel to fit the scale equation:
6,0.08
7,0.06
8,0.05
9,0.03
10,0.02
11,0.01
12,0.007
13,0.004
14,0.002
*/

  return ends;
}

/**  process Borehole data **/
function retreiveBoreholes() {
  let blob=ckExist('./csm_data/LuttrellHardebeckJGR2021_Table1.csv');
  let csvblob = $.csv.toArrays(blob);
  let sz=csvblob.length;
  for(let i=1; i<sz; i++) {
    let term=csvblob[i];
    let id=term[0];
    let type=term[1];
    let lat=term[2];
    let lon=term[3];
    let azimuth=term[6];
//
    csm_boreholes_latlngs.push({"lat":lat,"lon":lon});
    csm_boreholes_azimuth.push(azimuth);
    csm_boreholes_id.push(id);
//
    let tip="borehole:"+id+"<br>type:"+type+"<br>lat:"+lat+"<br>lon:"+lon+"<br>azimuth:"+azimuth;
    csm_boreholes_tips.push(tip);
  }
}

function makeBoreholeLayers(mymap) {

  let zoom=mymap.getZoom();
  if(!isEmptyDictionary(csm_boreholes_layer)
               && csm_boreholes_layer['zoom'] == zoom) {
    return;
  }

  let sz=csm_boreholes_latlngs.length;
  let ends=[];
  for(let i=0; i<sz; i++) {
    let latlngs=csm_boreholes_latlngs[i];
    let lat=latlngs["lat"];
    let lon=latlngs["lon"];
    let id=csm_boreholes_id[i];
    let azimuth=csm_boreholes_azimuth[i];
    let color=pixiGetSHmaxColor(azimuth); 
    csm_boreholes_colors.push(color);

    let end=calc_ends(i,lat,lon,azimuth,zoom); //[{"lat":lat,"lon":lon},{"lat":lat,"lon":lon}];
    ends.push({"id":id,"zoom":zoom,"ends":end});
  }

  let markergroup=addCircleMarkerLayerGroup(csm_boreholes_latlngs,csm_boreholes_tips,csm_boreholes_colors);
  let linegroup=addPolylineLayerGroup(ends);

  csm_boreholes_layer={ "zoom":zoom, "marker":markergroup, "line":linegroup };
}

function updateCSMBoreholes(mymap) {
  // only need to refresh
  if ($("#cxm-model-csm-boreholes").prop('checked')) {
          showCSMBoreholes(mymap);
  }
}

function showCSMBoreholes(mymap) {
  let zoom=mymap.getZoom();
  let t=csm_boreholes_layer;
  if(isEmptyDictionary(csm_boreholes_layer)) {
    makeBoreholeLayers(mymap);
    } else {
      if ( csm_boreholes_layer['zoom'] != zoom) {
        mymap.removeLayer(csm_boreholes_layer['marker']);
        mymap.removeLayer(csm_boreholes_layer['line']);
        csm_boreholes_layer={};
        makeBoreholeLayers(mymap);
      }
  }

  mymap.addLayer(csm_boreholes_layer['marker']);
  mymap.addLayer(csm_boreholes_layer['line']);
}

function hideCSMBoreholes(mymap) {
  if(isEmptyDictionary(csm_boreholes_layer)) {
    window.console.log("BAD..  should never be here..");
    return;
  }
  mymap.removeLayer(csm_boreholes_layer['marker']);
  mymap.removeLayer(csm_boreholes_layer['line']);
}

/************************************************************************************/
function _toPercent(v) {
// change 0.8 to "80%"
  let nv=Math.floor(v*100);
  let str=String(nv);
  return str;
}

function setupOpacitySlider(alpha) {
    var handle = $( "#opacitySlider-handle" );

    $( "#opacitySlider" ).slider({
      value:alpha,
      min: 0,
      max: 1,
      step: 0.1, 
      create: function() {
        handle.text( _toPercent($( this ).slider( "value" )) );
      },
      change: function ( event, ui ) { 
        handle.text( _toPercent(ui.value) );
        CSM.changePixiLayerOpacity(ui.value);
      }
    });
}

function setOpacitySliderHandle(alpha) {
    $( "#opacitySlider" ).slider( "option", "value", alpha);
}


