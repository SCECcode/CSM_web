/***
   cxm_html2canvas.js
***/

HTMLCanvasElement.prototype.getContext = function(origFn) {
  return function(type, attribs) {
	  window.console.log("    ----USING new getContext");
    attribs = attribs || {};
    attribs.preserveDrawingBuffer = true;
    return origFn.call(this, type, attribs);
  };
}(HTMLCanvasElement.prototype.getContext);


// https://github.com/niklasvh/html2canvas/issues/567
var transform=$(".leaflet-map-pane").css("transform");
if (transform) {
var c = transform.split(",");
var d = parseFloat(c[4]);
var h = parseFloat(c[5]);
$(".leaflet-map-pane").css({
"transform": "none",
"left": d,
"top": h
})
}


function toSnap() {
	window.console.log("toSnap");
	jpgDownload("csm_viewer_snap.jpg");
}

var isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
//var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
var isChrome = !!window.chrome && !!window.chrome.webstore;
var isIE = /*@cc_on!@*/false || !!document.documentMode;


function jpgDownload(fname) {

/***
HTMLCanvasElement.prototype.getContext = function(origFn) {
  return function(type, attribs) {
	  window.console.log("    ----USING newnew getContext");
    attribs = attribs || {};
    attribs.preserveDrawingBuffer = true;
    return origFn.call(this, type, attribs);
  };
}(HTMLCanvasElement.prototype.getContext);
***/

   var dname=fname;
   if(dname == null) {
     var f = new Date().getTime();
     var ff= f.toString();
     dname="csm_"+ff+".png";
   }

window.console.log("new dname is ",dname);

var elt = document.getElementById('top-map');
window.console.log("HERE");
let ww=elt.clientWidth;
let hh=elt.clientHeight;

var config = {
    useCORS: true,
    width: ww,
    height: hh,
    backgroundColor: null,
    logging: true,
    imageTimeout: 0
};

html2canvas(elt, config).then(function (canvas) {


//this canvas got a 'shifted svg and so need to redraw or recreate it.


window.console.log("SNAP..");

let map = document.querySelector(".leaflet-overlay-pane .leaflet-zoom-animated");
var transform=map.style.transform;

let svgs=document.getElementsByTagName("svg");
let $svg=svgs[0];

// https://github.com/niklasvh/html2canvas/issues/567
var ss=$svg.style;

if (transform) {
  window.console.log("SNAP:  transform ", transform);
  // translate3d(-64px, -57px, 0px)"
  var a = transform.split("(");
  var b = a[1].split(",");
  var c=b[0].split("p");
  var d=parseFloat(c[0]);
  var cc=b[1].split("p");
  var h = parseFloat(cc[0]);

  $svg.style.transform="";
  //$svg.style.left=d;
  //$svg.style.top=h;

  var newCanvas = document.createElement("canvas");
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;
  var newCtxt = newCanvas.getContext("2d");
  newCtxt.drawImage(canvas, 0,0, canvas.width, canvas.width,
                                  0,0, newCanvas.width, newCanvas.height);

  var rawImg = newCanvas.toDataURL("image/jpeg",1);


  var link = document.createElement('a');
  link.download = dname;
  link.href = rawImg;
  link.click();
  link.remove();
}

//$(svg).css({ left: 0, top: 0, transform: transform})
})

}


function jpgDownload0(fname) {

HTMLCanvasElement.prototype.getContext = function(origFn) {
  return function(type, attribs) {
    attribs = attribs || {};
    attribs.preserveDrawingBuffer = true;
    return origFn.call(this, type, attribs);
  };
}(HTMLCanvasElement.prototype.getContext);

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
       allowTaint:true,
       useCORS: true 
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

