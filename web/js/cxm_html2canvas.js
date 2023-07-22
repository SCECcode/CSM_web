/***
   cxm_html2canvas.js
***/

/**
HTMLCanvasElement.prototype.getContext = function(origFn) {
  return function(type, attribs) {
    attribs = attribs || {};
    attribs.preserveDrawingBuffer = true;
    return origFn.call(this, type, attribs);
  };
}(HTMLCanvasElement.prototype.getContext);
**/


function toSnap() {
	window.console.log("toSnap");
	jpgDownload("csm_viewer_snap.jpg");
}

var isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
//var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
var isChrome = !!window.chrome && !!window.chrome.webstore;
var isIE = /*@cc_on!@*/false || !!document.documentMode;


function jpgDownload(fname) {
   var dname=fname;
   if(dname == null) {
     var f = new Date().getTime();
     var ff= f.toString();
     dname="csm_"+ff+".jpg";
   }
window.console.log("new dname is ",dname);

	// top-map
   var  elt = document.getElementsByClassName('leaflet-pane leaflet-map-pane')[0];
   html2canvas(elt, {
       onrendered: function(canvas) {
// RETINA FIX
         var rawImg;
         var pixelDensityRatio=queryForRetina(canvas);

window.console.log("ration is ", pixielDensityRatio);

         if(pixelDensityRatio != 1) {

window.console.log("HERE 1");
           var newCanvas = document.createElement("canvas");
           var _width = canvas.width;
           var _height = canvas.height;
           newCanvas.width = _width;
           newCanvas.height = _height;
           var newCtxt = newCanvas.getContext("2d");
           newCtxt.drawImage(canvas, 0,0, _width, _height, 
                                  0,0, _width, _height);

           rawImg = newCanvas.toDataURL("image/jpeg",1);

           } else {
window.console.log("HERE 2");

             var ctxt = canvas.getContext("2d");
             rawImg = canvas.toDataURL("image/jpeg",1);
         }

window.console.log("HERE 3");
         if( ! isIE ) { // this only works for firefox and chrome
           var dload = document.createElement('a');
           dload.href = rawImg;
           dload.download = dname;
           dload.innerHTML = "Download Image File";
           dload.style.display = 'none';
           if( isChrome ) {
             dload.click();
             delete dload;
             } else {
               dload.onclick=destroyClickedElement;
               document.body.appendChild(dload);
               dload.click();
               delete dload;
           }
           } else {
             if(isSafari) {
               rawImg= rawImg.replace("image/jpeg", "image/octet-stream");
               document.location.href = rawImg;
               } else { // IE
                  var blob = dataUriToBlob(rawImg);
                  window.navigator.msSaveBlob(blob, dname);
             }
         }
       }, /* onrendered */
       useCORS: true, 
       width: 400,
       height: 500,
       backgroundColor: null,
       logging: true,
       imageTimeout: 0
   });
}


// testing for retina
function queryForRetina(canv) {
// query for various pixel ratios
 var ctxt = canv.getContext("2d");
 var devicePixelRatio = window.devicePixelRatio || 1;
 var backingStoreRatio = ctxt.webkitBackingStorePixelRatio ||
                         ctxt.mozBackingStorePixelRatio ||
                         ctxt.msBackingStorePixelRatio ||
                         ctxt.oBackingStorePixelRatio ||
                         ctxt.backingStorePixelRatio || 1;
  var pixelDensityRatio = devicePixelRatio / backingStoreRatio;

  return pixelDensityRatio;
}

