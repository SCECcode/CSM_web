/****

  csm_model.js

"For more model details and metrics, see [LINK TO ZENODO ARCHIVE]"

 optional:
    skip   not to show up in 'select CSM Models' pull down
    label_meta  to use in option of modelType
    data   to use different table_name for retrieving download data
****/

// stress_type: 0 = stress, 1 = stress rate
var CSM_tb={
models: [
    {name: 'FlatMaxwell', stress_type:0,
     label: 'FlatMaxwell - stress',
     author: 'P. Bird',
     description: '<b>FlatMaxwell</b> model contributed by P. Bird. This is a full absolute stress model based on forward physics-based modeling of tectonic loading. Model values vary with depth.'},
    {name: 'HardebeckFM', stress_type:0,
     label: 'Hardebeck_FM - stress',
     author: 'J. Hardebeck',
     description: '<b>Hardebeck_FM</b> model contributed by J. Hardebeck. This is a stress orientation model based on earthquake focal mechanism inversion (orientation only). Model values vary with depth.'},
    {name: 'Luttrell2017', stress_type:0,
     label: 'Luttrell-2017 - stress',
     author: 'K. Luttrell and B. Smith-Konter',
     description: '<b>Luttrell-2017</b> model contributed by K. Luttrell and B. Smith-Konter. This is a stress model of deviatoric stress required to support topography (no isotropic stress estimate). Model values do not vary with depth.'},
    {name: 'SHELLS', stress_type:0,
     label: 'SHELLS - stress',
     author: 'P. Bird',
     description: '<b>SHELLS</b> model contributed by P. Bird. This is a full absolute stress model based on forward physics-based modeling of tectonic loading. Model values vary with depth.'},
    {name: 'YH14K', stress_type:0,
     label: 'YH14-K - stress',
     author: 'T. Becker',
     description: '<b>YH14-K</b> model contributed by T. Becker. This is a stress orientation model based on earthquake focal mechanism Kostrov summation (orientation only). Model values do not vary with depth.'},
    {name: 'YHSM2013', stress_type:0,
     label: 'YHSM-2013 - stress',
     author: 'W. Yang and E. Hauksson',
     description: '<b>YHSM-2013</b> model contributed by W. Yang and E. Hauksson. This is a stress orientation model based on earthquake focal mechanism inversion (orientation only). Model values do not vary with depth.'},
    {name: 'LovelessMeade', stress_type:1,
     label: 'LovelessMeade - stressing rate',
     author: 'J. Loveless and B. Meade',
     description: '<b>LovelessMeade</b> model contributed by J. Loveless and B. Meade. This is a stressing-rate model based on a block model estimate of strain-rate. Model values vary with depth.'},
    {name: 'NeoKinema', stress_type:1,
     label: 'NeoKinema - stressing rate',
     author: 'P. Bird and E. Hearn',
     description: '<b>NeoKinema</b> model contributed by P. Bird and E. Hearn. This is a stressing-rate model based on forward physics-based modeling of tectonic loading. Model values do not vary with depth.'},
    {name: 'SAFPoly3D', stress_type:1,
     label: 'SAFPoly3D - stressing rate',
     author: 'M. Cooke',
     description: '<b>SAFPoly3D</b> model contributed by M. Cooke. This is a stressing-rate model based on forward physics-based modeling of tectonic loading. Model values vary with depth.'},
    {name: 'UCERF3ABM', stress_type:1,
     label: 'UCERF3_ABM - stressing rate',
     author: 'K. Johnson',
     description: '<b>UCERF3_ABM</b> model contributed by K. Johnson. This is a stressing-rate model based on a block model estimate of strain-rate. Model values vary with depth.'},
    {name: 'Zeng', stress_type:1,
     label: 'Zeng - stressing rate',
     author: 'Y. Zeng and Z. Shen',
     description: '<b>Zeng</b> model contributed by Y. Zeng and Z. Shen. This is a stressing-rate model based on forward physics-based modeling of tectonic loading.'},
    {name: 'H2020Ridgecrest', stress_type:0,
     label: 'H2020_Ridgecrest - stress',
     author: 'J.L. Hardebeck',
     description: '<b>H2020_Ridgecrest</b> model contributed by J. Hardebeck. This is a stress orientation model based on earthquake focal mechanism inversion (orientation only). Model values do not vary with depth.'},
    {name: 'HM04NorCalClusterBased', stress_type:0,
     label: 'HM04_NorCal_ClusterBased - stress',
     author: 'J.L. Hardebeck and A.J. Michael',
     description: '<b>HM04_NorCal_ClusterBased</b> model contributed by J. Hardebeck and A. Michael. This is a stress orientation model based on earthquake focal mechanism inversion (orientation only). Model values do not vary with depth.'},
    {name: 'HM04NorCalFaultBased', stress_type:0,
     label: 'HM04_NorCal_FaultBased - stress',
     author: 'J.L. Hardebeck and A.J. Michael',
     description: '<b>HM04_NorCal_FaultBased</b> model contributed by J. Hardebeck and A. Michael. This is a stress orientation model based on earthquake focal mechanism inversion (orientation only). Model values do not vary with depth.'},
    {name: 'PEZW02LongValley', stress_type:0,
     label: 'PEZW02_LongValley - stress',
     skip: 1,
     author: 'S. Prejean, W. Ellsworth, M. Zoback, and F. Waldhauser',
     description: '<b>PEZW02_LongValley</b> model contributed by S. Prejean, W. Ellsworth, M. Zoback, and F. Waldhauser. This is a stress orientation model based on earthquake focal mechanism inversion (orientation only). Model values do not vary with depth.  Model gives principal stress axis orientation only. Visualized SHmax values are approximate (±15º) and Aphi values represent faulting regime only.'}, 
    {name: 'PEZW02LongValleyforplottingonly', stress_type:0,
     label: 'PEZW02LongValley - stress',
     label_meta: 'XXPEZW02LongValley',
     data: 'pezw02longvalley_tb',
     author: 'S. Prejean, W. Ellsworth, M. Zoback, and F. Waldhauser',
     description: '<b>PEZW02LongValleyforplottingonly</b> model contributed by S. Prejean, W. Ellsworth, M. Zoback, and F. Waldhauser. This is a stress orientation model based on earthquake focal mechanism inversion (orientation only). Model values do not vary with depth.  Model gives principal stress axis orientation only. Visualized SHmax values are approximate (±15º) and Aphi values represent faulting regime only.'}, 
    {name: 'PH01CreepingTable1', stress_type:0,
     label: 'PH01_Creeping_Table1 - stress',
     author: 'A.S. Provost and H. Houston',
     description: '<b>PH01_Creeping_Table1</b> model contributed by A. Provost and H. Houston. This is a stress orientation model based on earthquake focal mechanism inversion (orientation only). Model values do not vary with depth.'},
    {name: 'PH01CreepingTable2', stress_type:0,
     label: 'PH01_Creeping_Table2 - stress',
     author: 'A.S. Provost and H. Houston',
     description: '<b>PH01_Creeping_Table2</b> model contributed by A. Provost and H. Houston. This is a stress orientation model based on earthquake focal mechanism inversion (orientation only). Model values do not vary with depth.'},
    {name: 'PH03NorCal', stress_type:0,
     label: 'PH03_NorCal - stress',
     author: 'A.S. Provost and H. Houston',
     description: '<b>PH03_NorCal</b> model contributed by A. Provost and H. Houston. This is a stress orientation model based on earthquake focal mechanism inversion (orientation only). Model values do not vary with depth.'},
    {name: 'SHS23MtLewis', stress_type:0,
     label: 'SHS23_MtLewis - stress',
     author: 'R.J. Skoumal, J.L. Hardebeck and D.R. Shelly',
     description: '<b>SHS23_MtLewis</b> model contributed by R. Skoumal, J. Hardebeck, and D. Shelly. This is a stress orientation model based on earthquake focal mechanism inversion (orientation only). Model values do not vary with depth.'},
    {name: 'JohnsonHearn', stress_type:0,
     label: 'Johnson-Hearn - stress rate',
     author: 'K. Johnson and E. Hearn',
     description: '<b>Johnson-Hearn</b> model contributed by K. Johnson and E. Hearn.  This is a stressing-rate model based on geodetically inferred strain rates. Model values do not vary with depth.'},
    {name: 'KreemerHearn', stress_type:0,
     label: 'Kreemer-Hearn - stress rate',
     author: 'C. Kreemer, Z. Young and E. Hearn',
     description: '<b>Kreemer-Hearn</b> model contributed by C. Kreemer, Z. Young, and E. Hearn. This is a stressing-rate model based on combined geologically and geodetically inferred strain rates. Model values do not vary with depth.'}],
metrics: [
    {name: 'SHmax', range: [90, -90], 
     short: 'SHmax [orientation]', label: 'SHmax - horizontal compression azimuth [orientation]',
     description: '<b>SHmax</b> indicates the azimuth [orientation] of the most compressive horizontal stress is north/south (0), east/west (+/-90), northeast/southwest (positive), or northwest/southeast (negative).'},
    {name: 'Aphi', range: [0, 3], 
     short: 'Aphi [orientation]', label: 'Aphi - Anderson modified shape parameter [orientation]',
     description: '<b>Aphi</b> combines the shape parameter ratio of principal stresses with the expected faulting regime based on which principal stress is most vertical. Fault regime is normal faulting (0-1), strike-slip faulting (1-2), or reverse faulting (2-3).'}, 
    {name: 'Iso', range: [], 
     short: 'Isotropic pressure [magnitude]', label: 'Isotropic pressure - (S1+S2+S3)/3 [magnitude]',
     description: '<b>Isotropic stress</b> indicates the mean of the principal stresses (S1+S2+S3)/3 is tensional (positive) or compressional (negative). For easier visualization, the display range excludes the highest and lowest 0.1% of values.'},
    {name: 'Dif', range: [], 
     short: 'Differential stress [magnitude]', label: 'Differential stress - (S1-S3) [magnitude]',
     description: '<b>Differential stress</b> is the difference between the most tensional and most compressional principal stresses S1-S3. It is always positive. For easier visualization, the display range excludes the highest and lowest 0.1% of values.'}],   
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

