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
      let model_type=$(this).val();
	  
<<<<<<< HEAD
      CSM.setupModelMetric2(CSM.csm_models,model_type);
      CSM.setupModelDepth2(CSM.csm_models,model_type);

      CSM.clearSearch();
=======
      CSM.setupModelMetric(CSM.csm_models,model_type);
      CSM.setupModelDepth(CSM.csm_models,model_type);
      CSM.freshSearch();
>>>>>>> f2cf35843a20f3322a73da70732ce64336a80822
  });

  $('#modelDepth').on("change", function() {
      let model_depth=$(this).val();
      CSM.changeModelDepth(model_depth);
window.console.log("--- changing modelDepth");
  });
  $('#modelMetric').on("change", function() {
      let model_metric=$(this).val();
      CSM.changeModelMetric(model_metric);
window.console.log("--- changing modelMetric");
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

window.console.log("DONE initialize from  Main");

}); // end of MAIN



