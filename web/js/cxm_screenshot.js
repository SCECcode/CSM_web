/***
   cxm_screenshot.js
***/

function jpgDownload0(fname) {
   var dname=fname;
   if(dname == null) {
     var f = new Date().getTime();
     var ff= f.toString();
     dname="isrd_"+ff+".jpg";
   }

   html2canvas(document.body, {
       onrendered: function(canvas) {
/*
           return Canvas2Image.saveAsPNG(canvas);
*/
    document.body.appendChild(canvas);
    canvas.id = "ctx"
    var ctx = document.getElementById('ctx');
    var img = ctx.toDataURL("image/png");
    window.open(img);

      }});
}

function jpgDownload2(fname) {
   var dname=fname;
   if(dname == null) {
     var f = new Date().getTime();
     var ff= f.toString();
     dname="isrd_"+ff+".jpg";
   }

   var items = document.getElementsByTagName("canvas");
   var cnt=items.length;
window.console.log("NUMBER OF canvas is ",cnt);
   var _canvas=items[0];
window.console.log(typeof _canvas);
   var rawImg = _canvas.toDataURL("image/jpeg");
   rawImg= rawImg.replace("image/jpeg", "image/octet-stream");
   document.location.href = rawImg;
}

var isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
//var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
var isChrome = !!window.chrome && !!window.chrome.webstore;
var isIE = /*@cc_on!@*/false || !!document.documentMode;

function jpgDownload3(fname) {
   var dname=fname;
   if(dname == null) {
     var f = new Date().getTime();
     var ff= f.toString();
     dname="isrd_"+ff+".jpg";
   }

   html2canvas(document.body, {
       onrendered: function(canvas) {
// RETINA FIX
       var rawImg;
       var pixelDensityRatio=queryForRetina(canvas);
       if(pixelDensityRatio != 1) {
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
           var ctxt = canvas.getContext("2d");
           rawImg = canvas.toDataURL("image/jpeg",1);
       }

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
       }
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

