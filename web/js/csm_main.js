/***
   csm_main.js
***/

var initial_page_load = false;
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
    window.console.log("OH NO.. I am on Mini.."+screen.width);
    //location.href = '/mobile.html';
  }

  viewermap=setup_viewer();

  $('#modelType').on("change", function() {
      let model_type=$(this).val();
window.console.log("--- changing modelModel");
      CSM.changeModelModel(CSM.csm_models, model_type);
  });

  $('#modelDepth').on("change", function() {
      let model_depth=$(this).val();
      CSM.changeModelDepth(model_depth);
//window.console.log("--- changing modelDepth");
  });
  $('#modelMetric').on("change", function() {
      let model_metric=$(this).val();
      CSM.changeModelMetric(model_metric);
//window.console.log("--- changing modelMetric");
  });

  $("#toReset").on('click', function () {
window.console.log("Calling toReset..");
        CSM.resetAll();
  });

/***
  $('.csm-latlon-item').on("focus", function() {
     $('.csm-latlon-item').on("blur mouseout", function() {
       $('.csm-latlon-item').off("mouseout");
       $('.csm-latlon-item').off("blur");
       if( $(this).val() != '' ) {
	 $("#searchAgain").click();
       }
       $(this).blur();
     });
  });
***/

  $("#cxm-model-csm-boreholes").change(function() {
      if ($("#cxm-model-csm-boreholes").prop('checked')) {
          showCSMBoreholes(viewermap);
          } else {
              hideCSMBoreholes(viewermap);
      }
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


// MAIN SETUP

// load the data from backend and setup layers
  CSM.processModelMeta();

  setup_pixi();

// setup the interface 
  CSM.setupCSMInterface();

window.console.log("DONE initialize from  Main");

  $.event.trigger({ type: "page-ready", "message": "completed", });

}); // end of MAIN



