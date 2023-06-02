/***
   csm_main.js
***/

var initial_page_load = true;
var csm_site_data=null;
var viewermap;

var csm_meta_data=null;

jQuery(document).ready(function() {

  frameHeight=window.innerHeight;
  frameWidth=window.innerWidth;

  var uagent = navigator.userAgent.toLowerCase();

  window.console.log("WHAT am I !! >>> "+uagent);
  window.console.log("screen width..("+screen.width+") and frame width..",frameWidth);

//if (navigator.userAgentData.mobile) { // do something }

  if( screen.width <= 480 ) {
    window.console.log("OH NO.. I am on Mini.."+screen_width);
    //location.href = '/mobile.html';
  }

  viewermap=setup_viewer();

  $('.csm-depth-item').on("focus", function() {
     $('.csm-depth-item').on("blur mouseout", function() {
       $('.csm-depth-item').off("mouseout");
       $('.csm-depth-item').off("blur");
       if( $(this).val() != '' ) {
         CSM.refreshDepthSlider();
       }
       $(this).blur();
     });
  });

  $('.csm-latlon-item').on("focus", function() {
     $('.csm-latlon-item').on("blur mouseout", function() {
       $('.csm-latlon-item').off("mouseout");
       $('.csm-latlon-item').off("blur");
       if( $(this).val() != '' ) {
         window.console.log(" need to call search by latlon ");
         CSM.searchLatlon(0, []);
       }
       $(this).blur();
     });
  });

  $("#csm-search-type").on('change', function () {
      let type=$(this).val();
  window.console.log( "initiate a search session...",type);
      if(type != "") {
        CSM.freshSearch(type);
      }
  });

  $("#toSearch").on('click', function () {
window.console.log("Calling toSearch..");
        CSM.freshSearch(0); // type = 0, first one
  });

  $("#cxm-model-cfm").change(function() {
      if ($("#cxm-model-cfm").prop('checked')) {
          CXM.showCFMFaults(viewermap);
          } else {
              CXM.hideCFMFaults(viewermap);
      }
  });

  $("#cxm-model-gfm").change(function() {
      if ($("#cxm-model-gfm").prop('checked')) {
          CXM.showGFMRegions(viewermap);
          } else {
              CXM.hideGFMRegions(viewermap);
      }
  });

  $.event.trigger({ type: "page-ready", "message": "completed", });


// MAIN SETUP

// load the data from backend and setup layers
  CSM.processModelMeta();
// setup the interface 
  CSM.setupCSMInterface();
window.console.log("after main");

}); // end of MAIN



