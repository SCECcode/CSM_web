/****

  csm_model.js

****/

// stress_type: 0 = stress, 1 = stress rate
var CSM_tb={
models: [
    {name: 'FlatMaxwell', stress_type:0,
     label: 'stress - FlatMaxwell'},
    {name: 'HardebeckFM', stress_type:0,
     label: 'stress - Hardebeck_FM'},
    {name: 'Luttrell2017', stress_type:0,
     label: 'stress - Luttrell-2017'},
    {name: 'SHELLS', stress_type:0,
     label: 'stress - SHELLS'},
    {name: 'YH14K', stress_type:0,
     label: 'stress - YH14-K'},
    {name: 'YHSM2013', stress_type:0,
     label: 'stress - YHSM-2013'},
    {name: 'LovelessMeade', stress_type:1,
     label: 'stressing rate - LovelessMeade'},
    {name: 'NeoKinema', stress_type:1,
     label: 'stressing rate - NeoKinema'},
    {name: 'SAFPoly3D', stress_type:1,
     label: 'stressing rate - SAFPoly3D'},
    {name: 'UCERF3ABM', stress_type:1,
     label: 'stressing rate - UCERF3_ABM'},
    {name: 'Zeng', stress_type:1,
     label: 'stressing rate - Zeng'}],
metrics: [
    {name: 'SHmax', range: [90, -90]},
    {name: 'Aphi', range: [0, 3]},
    {name: 'Iso', range: []},
    {name: 'Dif', range: []}],
meta_descript: [
    {label:'LON',descript:'XXX'},
    {label:'LAT',descript:'XXX'},
    {label:'DEP',descript:'XXX'},
    {label:'See',descript:'XXX'},
    {label:'Sen',descript:'XXX'},
    {label:'Seu',descript:'XXX'},
    {label:'Snn',descript:'XXX'},
    {label:'Snu',descript:'XXX'},
    {label:'Suu',descript:'XXX'},
    {label:'SHmax',descript:'XXX'},
    {label:'SHmax_unc',descript:'XXX'},
    {label:'phi',descript:'XXX'},
    {label:'R',descript:'XXX'},
    {label:'Aphi',descript:'XXX'},
    {label:'iso',descript:'XXX'},
    {label:'dif',descript:'XXX'},
    {label:'mss',descript:'XXX'},
    {label:'S1',descript:'XXX'},
    {label:'S2',descript:'XXX'},
    {label:'S3',descript:'XXX'},
    {label:'V1x',descript:'XXX'},
    {label:'V1y',descript:'XXX'},
    {label:'V1z',descript:'XXX'},
    {label:'V2x',descript:'XXX'},
    {label:'V2y',descript:'XXX'},
    {label:'V2z',descript:'XXX'},
    {label:'V3x',descript:'XXX'},
    {label:'V3y',descript:'XXX'},
    {label:'V3z',descript:'XXX'},
    {label:'V1pl',descript:'XXX'},
    {label:'V2pl',descript:'XXX'},
    {label:'V3pl',descript:'XXX'},
    {label:'V1azi',descript:'XXX'},
    {label:'V2azi',descript:'XXX'},
    {label:'V3azi',descript:'XXX'}]
};

