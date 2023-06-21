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

  $('#modelType').on("change", function() {
      let type=$(this).val();
      CSM.setupModelDepth(CSM.csm_models,type);
      // reset metric to 0
      CSM.setupModelMetric(CSM.csm_models,0);
  });

  $('.csm-model-item').on("focus", function() {
     $('.csm-model-item').on("blur mouseout", function() {
       $('.csm-model-item').off("mouseout");
       $('.csm-model-item').off("blur");
       if( $(this).val() != '' ) {
         window.console.log(" need to redraw the pixi overlay with the given string", $(this).val());
         CSM.redrawModel($(this).val());
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
      CSM.showSearch(type);
  });

  $("#toSearch").on('click', function () {
window.console.log("Calling toSearch..");
        CSM.freshSearch();
  });


  $("#toReset").on('click', function () {
window.console.log("Calling toReset..");
        CSM.resetAll();
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

  setup_pixi();

// setup the interface 
  CSM.setupCSMInterface();

window.console.log("after main");
window.console.log("current zoom ", viewermap.getZoom());

}); // end of MAIN



