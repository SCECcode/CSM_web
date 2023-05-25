/****

  ucvm_region_util.js

****/

// information on model 
var UCVM_installed=[];

// str is a blob { 'models': ['cvmh','cvms5'] }
function makeInstallModelList(str) {
  var blob;
  if( str == undefined || str == "" ) {
     window.console.log("ERROR: no return result");
     return "";
  }
  if( typeof str === 'string') {
     blob=JSON.parse(str);
     } else {
       blob=str;
  }
  var mlist=blob['models'];
  var cnt=mlist.length;
  var i;
  for(i=0;i<cnt;i++) {
    var item=mlist[i];
    UCVM_installed.push(item);
  }

  setup_modeltype();
}

function isModelInstalled(pname) {
  var cnt=UCVM_installed.length;
  var i=0;
  for(i=0; i<cnt;i++) {
     if(UCVM_installed[i]==pname) {
        return 1;
     }
  }
  return 0;
}

function makeModelSelection()
{
   var tb=UCVM_tb['models'];
   var cnt=tb.length;
   var i;
   var option;
   for(i=0; i<cnt; i++) {
     var item=tb[i];
     var color=item['color'];
     var aname=item['abb name'];
     var mname=item['model name'];
     var pname=item['path name'];
     // check the model directory to make sure it exists before adding 
     // the option
     if(isModelInstalled(pname)) {
window.console.log(pname);
        var sel=document.getElementById('modelType');
        option = document.createElement("option");
        option.text = mname;
        option.label = mname;
        option.value= aname;
        sel.add(option);
     }
   } 
   // special case
   var sel=document.getElementById('modelType');
   option = document.createElement("option");
   option.text = "-- Advanced --";
   option.setAttribute("disabled", true);
   option.value= "disabled";
   sel.add(option);

if(isModelInstalled("cvms5") && isModelInstalled("cencal")
   && isModelInstalled("CCA")) {
option = document.createElement("option");
option.text = "CCA,cencal,CVM-S4.26,elygtl:ely";
option.label = "CCA,cencal,CVM-S4.26,elygtl:ely";
option.value= "cca,cencal,cvms5,elygtl:ely";
sel.add(option);
}

   if(isModelInstalled("1d")) {
     option = document.createElement("option");
     option.text = "1D";
     option.label = "1D";
     option.value= "1d"; 
     sel.add(option);
   }

   if(
isModelInstalled("cvmhlabn") && isModelInstalled("cvmhsgbn"),
isModelInstalled("cvmhvbn") && isModelInstalled("cvmhrbn"),
isModelInstalled("cvmhibbn") && isModelInstalled("cvmhsmbn"),
isModelInstalled("cvmhsbbn") && isModelInstalled("cvmhsbcbn"),
isModelInstalled("cvmhstbn") && isModelInstalled("cvmsi")
) {
     option = document.createElement("option");
     option.text = "CVM-H All Basins, CVM-S4.26.M01";
     option.value= "cvmhlabn,cvmhsgbn,cvmhvbn,cvmhrbn,cvmhibbn,cvmhsmbn,cvmhsbbn,cvmhsbcbn,cvmhstbn,cvmsi";
     sel.add(option);
   }

   if(isModelInstalled("sfcvm") && isModelInstalled("1d")) {
     option = document.createElement("option");
     option.text = "SFCVM,1D";
     option.label = "SFCVM,1D";
     option.value= "SFCVM,1d"; 
     sel.add(option);
   }

   if(isModelInstalled("sjfz") && isModelInstalled("1d")) {
     option = document.createElement("option");
     option.text = "SJFZ,1D";
     option.label = "SJFZ,1D";
     option.value= "sjfz,1d"; 
     sel.add(option);
   }

   if(isModelInstalled("sjfz")) {
     option = document.createElement("option");
     option.text = "SJFZ,elygtl:ely";
     option.label = "SJFZ,elygtl:ely";
     option.value= "sjfz,elygtl:ely"; 
     sel.add(option);
   }

/*
   if(isModelInstalled("sjfz")) {
     option = document.createElement("option");
     option.text = "SJFZ,elygtl:taper";
     option.label = "SJFZ,elygtl:taper";
     option.value= "sjfz,elygtl:taper"; 
     sel.add(option);
   }

   if(isModelInstalled("cvms")) {
     option = document.createElement("option");
     option.text = "CVM-S4,elygtl:taper";
     option.label = "CVM-S4,elygtl:taper";
     option.value= "cvms,elygtl:taper";
     sel.add(option);
   }
*/

   if(isModelInstalled("cvms5")) {
     option = document.createElement("option");
     option.text = "CVM-S4.26,elygtl:ely";
     option.label = "CVM-S4.26,elygtl:ely";
     option.value= "cvms5,elygtl:ely";
     sel.add(option);
   }

/*
   if(isModelInstalled("cvms5")) {
     option = document.createElement("option");
     option.text = "CVM-S4.26,elygtl:taper";
     option.label = "CVM-S4.26,elygtl:taper";
     option.value= "cvms5,elygtl:taper";
     sel.add(option);
   }
*/

   if(isModelInstalled("cvmsi")) {
     option = document.createElement("option");
     option.text = "CVM-S4.26M01,elygtl:ely";
     option.label = "CVM-S4.26M01,elygtl:ely";
     option.value= "cvmsi,elygtl:ely";
     sel.add(option);
   }

/*
   if(isModelInstalled("cvmsi")) {
     option = document.createElement("option");
     option.text = "CVM-S4.26M01,elygtl:taper";
     option.label = "CVM-S4.26M01,elygtl:taper";
     option.value= "cvmsi,elygtl:taper";
     sel.add(option);
   }
*/

   if(
isModelInstalled("cvmhlabn") && isModelInstalled("cvmhsgbn") &&
isModelInstalled("cvmhvbn") && isModelInstalled("cvmhrbn") &&
isModelInstalled("cvmhibbn") && isModelInstalled("cvmhsmbn") &&
isModelInstalled("cvmhsbbn") && isModelInstalled("cvmhsbcbn") &&
isModelInstalled("cvmhstbn")
) {
     option = document.createElement("option");
     option.text = "CVM-H All Basins";
     option.label = "CVM-H All Basins";
     option.value= "cvmhlabn,cvmhsgbn,cvmhvbn,cvmhrbn,cvmhibbn,cvmhsmbn,cvmhsbbn,cvmhsbcbn,cvmhstbn";
     sel.add(option);
   }

   if(isModelInstalled("cvmhlabn") && isModelInstalled("1d")) {
     option = document.createElement("option");
     option.text = "CVM-H LA Basin,1D";
     option.label = "CVM-H LA Basin,1D";
     option.value= "cvmhlabn,1d"; 
     sel.add(option);
   }

   if(isModelInstalled("cvmhsmbn") && isModelInstalled("cvmhlabn") && isModelInstalled("1d")) {
     option = document.createElement("option");
     option.text = "CVM-H Santa Maria Basin,CVM-H LA Basin,1D";
     option.label = "CVM-H Santa Maria Basin,CVM-H LA Basin,1D";
     option.value= "cvmhsmbn,cvmhlabn,1d"; 
     sel.add(option);
   }

   if(
isModelInstalled("cvmhlabn") && isModelInstalled("cvmhsgbn") &&
isModelInstalled("cvmhvbn") && isModelInstalled("cvmhrbn") &&
isModelInstalled("cvmhibbn") && isModelInstalled("cvmhsmbn") &&
isModelInstalled("cvmhsbbn") && isModelInstalled("cvmhsbcbn") &&
isModelInstalled("cvmhstbn") && isModelInstalled("cvmsi")
) {
     option = document.createElement("option");
     option.text = "CVM-H All Basins, CVM-S4.26.M01";
     option.label = "CVM-H All Basins, CVM-S4.26.M01";
     option.value= "cvmhlabn,cvmhsgbn,cvmhvbn,cvmhrbn,cvmhibbn,cvmhsmbn,cvmhsbbn,cvmhsbcbn,cvmhstbn,cvmsi";
     sel.add(option);
   }

   if( isModelInstalled("cvmhsmbn") && isModelInstalled("cvms5") ) {
     option = document.createElement("option");
     option.text = "CVM-H Santa Maria, CVM-S4.26";
     option.label = "CVM-H Santa Maria, CVM-S4.26";
     option.value= "cvmhsmbn,cvms5";
     sel.add(option);
   }

   if(isModelInstalled("cvms5") && isModelInstalled("cvmh")) {
     option = document.createElement("option");
     option.text = "CVM-S4.26,CVM-H v15.1.1";
     option.label = "CVM-S4.26,CVM-H v15.1.1";
     option.value= "cvms5,cvmh"; 
     sel.add(option);
   }

   if(isModelInstalled("cvms5") && isModelInstalled("1d")) {
     option = document.createElement("option");
     option.text = "CVM-S4.26,1D";
     option.label = "CVM-S4.26,1D";
     option.value= "cvms5,1d"; 
     sel.add(option);
   }

   if(isModelInstalled("albacore") && isModelInstalled("1d")) {
     option = document.createElement("option");
     option.text = "ALBACORE,1D";
     option.label = "ALBACORE,1D";
     option.value= "albacore,1d"; 
     sel.add(option);
   }

   if(isModelInstalled("ivlsu") && isModelInstalled("1d")) {
     option = document.createElement("option");
     option.text = "SSIP Imperial Valley,1D";
     option.label = "SSIP Imperial Valley,1D";
     option.value= "ivlsu,1d"; 
     sel.add(option);
   }

   if(isModelInstalled("cvlsu") && isModelInstalled("1d")) {
     option = document.createElement("option");
     option.text = "SSIP Coachella Valley,1D";
     option.label = "SSIP Coachella Valley,1D";
     option.value= "cvlsu,1d"; 
     sel.add(option);
   }

// put in the default region on the map
   makeLatlngsCoordinate('cvmh');
}

function getModelColor(target_nm) {
   var tb=UCVM_tb['models'];
   var icnt=tb.length;
   var i;
   for(i=0; i<icnt; i++) {
     var item=tb[i];
     if(item['abb name'] == target_nm) {
        var color=item['color'];
        return color;
     }
  }
  return "black";
}

// this is an optional field, vs30/topo etree map
function getModelMap(target_nm) {
   var tb=UCVM_tb['models'];
   var icnt=tb.length;
   var i;
   for(i=0; i<icnt; i++) {
     var item=tb[i];
     if(item['abb name'] == target_nm) {
        if(item.has('map')) {
           return item['map'];
        }
     }
  }
  return NULL;
}

function makeLatlngsCoordinate(target_nm) {

   var ret=[];
   var tb=UCVM_tb['models'];
   var icnt=tb.length;
   var lon, lat;
   var i,j;
   for(i=0; i<icnt; i++) {
     var item=tb[i];
     if(item['abb name'] == target_nm) {
        var coord=item['coordinates'];
        var jcnt=coord.length;
        for(j=0;j<jcnt;j++) {
          var c=coord[j];
          lon=c['lon'];
          lat=c['lat'];
          ret[ret.length]=([lat, lon]);      
        }
//        window.console.log(ret);
        return ret;
      }
   }
   return ret;
}

function makeModelTable() {
   var tb=UCVM_tb['models'];
   var cnt=tb.length;
   var i;
   var tbhtml="<table><tbody><tr><td style=\"border:1px solid white;\">UCVM Model Table</td></tr></tbody></table>";
   tbhtml=tbhtml+"<div class=\"ucvm-table\"><table><tbody>";
   tbhtml=tbhtml+"<tr><th style=\"width:8vw\"><b>Model</b></th><th style=\"width:6vw\"><b>UCVM abbreviation</b></th><th style=\"width:40vw\"><b>Description</b></th></tr>";

   for( i=0; i<cnt; i++) {
     var item=tb[i];
     var mname=item['model name'];
     var aname=item['abb name'];
     var pname=item['path name'];
     if(isModelInstalled(pname)) {
       var descript=item['description'];
       var t="<tr><td style=\"width:6vw\">"+mname+"</td><td style=\"width:6vw\">"+aname+"</td><td style=\"width:40vw\">"+descript+"</td></tr>";
       tbhtml=tbhtml+t;
     }
   }
   tbhtml=tbhtml+"</tbody></table></div>";
   return tbhtml;
}

function _getModelItemWithID(id) {
   var tb=UCVM_tb['models'];
   var cnt=tb.length;
   var i;
   for(i=0; i<cnt;i++) {
      var model=tb[i];
      if(model['id'] == id) {
        return model;
      }
   }
   return undefined;
}

function getModelNameWithID(id) {
   var item=_getModelItemWithID(id);
   if(item != undefined) {
       var n= item['model name'];
       return n;
   }
   return undefined;
}

function getModelNameWithType(t) {
   // t could be multiple, "albacore,cvms"
   var rt="";
   var mlist=t.split(',');
   var mcnt=mlist.length;
   var tlist=UCVM_tb['models'];
   var tcnt=tlist.length;
   var i,j;

   for(i=0;i<mcnt;i++) {
      for(j=0; j<tcnt;j++) {
         var target=tlist[j];
         if(target['abb name'] == mlist[i]) {
            rt=rt+target['model name'];
            if(mcnt>1 && i!=(mcnt-1))
               rt=rt+", ";
            break;
	 } 
      }
      if(j == tcnt) { // not found
         rt=rt+mlist[i];
      }
   }
   if(rt=="")
       rt=undefined;
   return rt;
}
function getZModeNameWithType(t) {
   var tb=UCVM_tb['zmodes'];
   var cnt=tb.length;
   var i;
   for(i=0; i<cnt;i++) {
      var zmode=tb[i];
      if(zmode['value'] == t) {
        return zmode['mode name'];
      }
   }
   return undefined;
}

function getModelColorWithID(id) {
   var item=_getModelItemWithID(id);
   if(item != undefined) {
       var c= item['color'];
       return c;
   }
   return undefined;
}

function getModelCoordinatesWithID(id) {
   var item=_getModelItemWithID(id);
   if(item != undefined) {
       var coord= item['coordinates'];
       return coord;
   }
   return undefined;
}

function getAllModelNames() {
   var ret=[];
   var tb=UCVM_tb['models'];
   var cnt=tb.length;
   var i,item,aname;
   for(i=0; i<cnt; i++) {
     item=tb[i]; 
     aname=item['abb name'];
     ret.push(aname);
   }
   return ret;
}

function showInTable(key) {
   var tb=UCVM_tb['descript'];
   var cnt=tb.length;
   for( i=0; i<cnt; i++) {
     var item=tb[i];
     var label=item['id'];
     if(label == key) {
       return item['show'];
     }
  }
  window.console.log("ERROR, showInTable, no such key",key);
  return 0;
}

function makeParametersTable() {
   var tb=UCVM_tb['descript'];
   var cnt=tb.length;
   var i;
   var tbhtml="<table><tbody><tr><td style=\"border:1px solid white;\">UCVM Parameters Table</td></tr></tbody></table>";
   tbhtml=tbhtml+"<div class=\"ucvm-table\"><table><tbody>";
   tbhtml=tbhtml+"<tr><th style=\"width:10vw\"><b>Parameter</b></th><th style=\"width:45vw\"><b>Description</b></th></tr>";
   for( i=0; i<cnt; i++) {
     var item=tb[i];
     var label=item['id'];
     var descript=item['descript'];
     if( item['show'] ) {
       var t="<tr><td style=\"width:10vw\">"+label+"</td><td style=\"width:45vw\">"+descript+"</td></tr>";
       tbhtml=tbhtml+t;
     }
   }
   tbhtml=tbhtml+"</tbody></table></div>";
   return tbhtml;
}


function makeFileFormatTable() {
   var tb=UCVM_tb['fileformats'];
   var cnt=tb.length;
   var i;
   var tbhtml="<table><tbody><tr><td style=\"border:1px solid white;\">File Format Table</td></tr></tbody></table>";
   tbhtml=tbhtml+"<div class=\"ucvm-table\"><table><tbody>";
   tbhtml=tbhtml+"<tr><th style=\"width:12vw\"><b>Format</b></th><th style=\"width:4vw\"><b>suffix</b></th><th style=\"width:40vw\"><b>Description</b></th></tr>";

   for( i=0; i<cnt; i++) {
     var item=tb[i];
     var fname=item['format name'];
     var suffix=item['suffix'];
     var descript=item['description'];
     var t="<tr><td style=\"width:12vw\">"+fname+"</td><td style=\"width:4vw\">"+suffix+"</td><td style=\"width:40vw\">"+descript+"</td></tr>";
     tbhtml=tbhtml+t;
   }
   tbhtml=tbhtml+"</tbody></table></div>";
   return tbhtml;
}

function makeZModeTable() {
   var tb=UCVM_tb['zmodes'];
   var cnt=tb.length;
   var i;
   var tbhtml="<table><tbody><tr><td style=\"border:1px solid white;\">Z Mode Table</td></tr></tbody></table>";
   tbhtml=tbhtml+"<div class=\"ucvm-table\"><table><tbody>";
   tbhtml=tbhtml+"<tr><th style=\"width:8vw\"><b>Mode</b></th><th style=\"width:40vw\"><b>Description</b></th></tr>";

   for( i=0; i<cnt; i++) {
     var item=tb[i];
     var mname=item['mode name'];
     var descript=item['description'];
     var t="<tr><td style=\"width:6vw\">"+mname+"</td><td style=\"width:40vw\">"+descript+"</td></tr>";
     tbhtml=tbhtml+t;
   }
   tbhtml=tbhtml+"</tbody></table></div>";
   return tbhtml;
}
