CREATE TABLE %%csmtb%_tb (
   gid           serial PRIMARY KEY,

   LON     float DEFAULT 0.0,
   LAT     float DEFAULT 0.0,
   DEP     float DEFAULT 0.0,  

   See        float,
   Sen        float,
   Seu        float,
   Snn        float,
   Snu        float,
   Suu        float,

   SHmax      float,
   SHmax_unc  float,

   phi        float,
   R          float,
   Aphi       float,
   iso        float, 
   dif        float, 
   mss        float, 

   S1         float,
   S2         float,
   S3         float,

   V1x        float,
   V1y        float,
   V1z        float,

   V2x        float,
   V2y        float,
   V2z        float,

   V3x        float,
   V3y        float,
   V3z        float,

   V1pl       float,
   V2pl       float,
   V3pl       float,

   V1azi      float,
   V2azi      float,
   V3azi      float
);
SELECT AddGeometryColumn('','%%csmtb%_tb','geom','0','POINT',2);


