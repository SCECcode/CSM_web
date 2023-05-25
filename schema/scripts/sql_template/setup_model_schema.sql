CREATE TABLE %%csmtb%_tb (
   gid           serial PRIMARY KEY,

   LON     float DEFAULT 0.0,
   LAT     float DEFAULT 0.0,
   DEP     float DEFAULT 0.0,  

   See        float NOT NULL,
   Sen        float NOT NULL,
   Seu        float NOT NULL,
   Snn        float NOT NULL,
   Snu        float NOT NULL,
   Suu        float NOT NULL,

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

   V1x        float NOT NULL,
   V1y        float NOT NULL,
   V1z        float NOT NULL,

   V2x        float NOT NULL,
   V2y        float NOT NULL,
   V2z        float NOT NULL,

   V3x        float NOT NULL,
   V3y        float NOT NULL,
   V3z        float NOT NULL,

   V1pl       float NOT NULL,
   V2pl       float NOT NULL,
   V3pl       float NOT NULL,

   V1azi      float NOT NULL,
   V2azi      float NOT NULL,
   V3azi      float NOT NULL
);
SELECT AddGeometryColumn('','%%csmtb%_tb','geom','0','POINT',2);


