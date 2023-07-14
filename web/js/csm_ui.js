/***
   csm_ui.js

   specific to csm's viewer.php to expand the leaflet map view
***/

var showing_key = false;
var big_map=0; // 0,1(some control),2(none)

/************************************************************************************/

function showKey(minv,maxv,label) {
window.console.log("calling showing key");
    if (showing_key) {
        removeKey();
    } else {
        showing_key = true;
    }
    // truncate the values alittle..
    let min=Math.round(minv * 100) / 100;
    let max=Math.round(maxv * 100) / 100;

    $("#CSM_plot").prepend($("#plot-range-key-container").html());
    $("#plot-range-key span.min").html(min);
    $("#plot-range-key span.max").html(max);
    let elt = document.getElementById('plot-range-label-string');
    elt.innerHTML=label;

}

function removeKey() {
window.console.log("calling removing key");
    if(showing_key) {
      $("#CSM_plot #plot-range-key").remove();
      $("#CSM_plot #plot-range-label").remove();
      showing_key = false;
    }
}

/************************************************************************************/

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

function disable_record_btn() {
  $('#recordReferenceBtn').attr("disabled", true);
}

function enable_record_btn() {
  $('#recordReferenceBtn').attr("disabled", false);
}

function disable_last_record_btn() {
  $('#lastRecordedReferenceBtn').attr("disabled", true);
}

function enable_last_record_btn() {
  $('#lastRecordedReferenceBtn').attr("disabled", false);
}

/************************************************************************************/
function downloadBorehole() {
  saveAsURLFile('./csm_data/LuttrellHardebeckJGR2021_Table1.csv');
}

/**  process Borehole data **/
function retreiveBoreholes() {
  let blob=ckExist(./csm_data/LuttrellHardebeckJGR2021_Table1.csv');
  let csvblob = $.csv.toArrays(blob);
window.console.log("HERE...");
}
