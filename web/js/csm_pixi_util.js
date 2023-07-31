/***
   csm_pixi_util.js

   csm specific code/data for cxm_pixi.js

***/

/* How many segments to chunk a set of csm data */
const CSM_DEFAULT_DATA_SEGMENT_COUNT= 12; 

/* there are 3 different markerTextures set.. */
const CSM_TEXTURE_SETS= 3; 
var csmMarkerTexturesSet0=[];
var csmMarkerTexturesSet1=[];
var csmMarkerTexturesSet2=[];

var csm_pixi_cmap_tb={
  data_rgb: [
    { type:0,
      note:"for SHmax",
             rgbs: [ "rgb(0,0,77)",
                     "rgb(0,0,166)",
                     "rgb(0,0,255)",
                     "rgb(102,102,255)",
                     "rgb(166,166,255)",
                     "rgb(230,230,255)",
                     "rgb(255,230,230)",
                     "rgb(255,166,166)",
                     "rgb(255,102,102)", 
                     "rgb(255,0,0)",
                     "rgb(166,0,0)",
                     "rgb(77,0,0)"]},
    { type:1,
      note:"for Aphi",
             rgbs: [
                     "rgb(52,16,60)",
                     "rgb(59,91,169)",
                     "rgb(78,132,196)",
                     "rgb(130,210,225)",
                     "rgb(253,245,166)",
                     "rgb(247,237,65)",
                     "rgb(232,216,25)",
                     "rgb(220,183,38)",
                     "rgb(242,101,34)",
                     "rgb(239,60,35)",
                     "rgb(217,34,38)",
                     "rgb(131,21,23)"
	     ]},

    { type:2,
      note:"for Dif, Iso",
             rgbs: [ "rgb(140,62.125,115.75)",
                     "rgb(143,71,153.25)",
                     "rgb(133.25,87.125,187.75)",
                     "rgb(114.25,109.87,211.87)",
                     "rgb(91.125,137.38,211.88)",
                     "rgb(70.875,167,216)",
                     "rgb(59.125,194.25,193.88)",
                     "rgb(64.125,214.88,161.88)",
                     "rgb(84.75,226.75,129.38)", 
                     "rgb(120.12,230.75,105.13)",
                     "rgb(165.62,226.12,95.625)",
                     "rgb(211.12,217.38,106.37)"]}
  ]
};

/*************************************************************************/


function csm_init_pixi() {

  pixi_cmap_tb=csm_pixi_cmap_tb;
  PIXI_DEFAULT_DATA_SEGMENT_COUNT=CSM_DEFAULT_DATA_SEGMENT_COUNT;

// setup list for SHmax, Aphi, Iso, Dif
  let rgblist=pixiGetSegmentMarkerRGBList(0);
  for(let i =0; i< rgb_length; i++) {
    let name="markerSet0_"+i;
    let rgb=rgblist[i];
    let texture=pixiCreateBaseTexture(rgb,name);
    markerTexturesSet0.push(texture);
  }
  rgblist=pixiGetSegmentMarkerRGBList(1);
  for(let i =0; i< rgb_length; i++) {
    let name="markerSet1_"+i;
    let rgb=rgblist[i];
    let texture=pixiCreateBaseTexture(rgb,name);
    markerTexturesSet1.push(texture);
  }
  rgblist=pixiGetSegmentMarkerRGBList(2);
  for(let i =0; i< rgblist.length; i++) {
    let name="markerSet2_"+i;
    let rgb=rgblist[i];
    let texture=pixiCreateBaseTexture(rgb,name);
    markerTexturesSet2.push(texture);
  }

}

// given a shmax value, what color does it match too
// shmax is between -90 to 90
function pixiGetSHmaxColor(v) {
   let clist=refSegmentMarkerRGBList(0);
   let vs_max=90;
   let offset=getSegmentRangeIdx(parseInt(v), 12, 90, -90);
   return clist[offset];
}


