
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
var csm_boreholes_list=[];

function downloadBorehole() {
  saveAsURLFile('./csm_data/LuttrellHardebeckJGR2021_Table1.csv');
}

/**  process Borehole data **/
function retreiveBoreholes() {
  let blob=ckExist('./csm_data/LuttrellHardebeckJGR2021_Table1.csv');
  let csvblob = $.csv.toArrays(blob);

  let sz=csvblob.length;
  let latlngs=[];
  let tips=[];
  for(let i=1; i<sz; i++) {
    let term=csvblob[i];
    let lat=term[2];
    let lon=term[3];
    let ss=term[6];
window.console.log( ">>", lat, lon, ss);
    latlngs.push({"lat":lat,"lon":lon});
    tips.push(ss);
  }

  let group=addMarkerLayerGroup(latlngs,tips,5);
  csm_boreholes_list.push(group);
}

function showCSMBoreholes(viewermap) {
  if(csm_boreholes_list.length == 0) {
    return;
  }
  let layer=csm_boreholes_list[0];
  viewermap.addLayer(layer);
}

function hideCSMBoreholes() {
  if(csm_boreholes_list.length == 0) {
    return;
  }
  let layer=csm_boreholes_list[0];
  viewermap.removeLayer(layer);
}

/************************************************************************************/
function setupOpacitySlider(alpha) {
    var handle = $( "#opacitySlider-handle" );

    $( "#opacitySlider" ).slider({
      value:alpha,
      min: 0,
      max: 1,
      step: 0.1, 
      create: function() {
        handle.text( $( this ).slider( "value" ) );
      },
      change: function ( event, ui ) { 
        handle.text( ui.value );
        CSM.changePixiLayerOpacity(ui.value);
      }
    });
}

function setOpacitySliderHandle(alpha) {
    $( "#opacitySlider" ).slider( "option", "value", alpha);
}


