COPY FlatMaxwell_tb(LON,LAT,DEP,See,Sen,Seu,Snn,Snu,Suu,SHmax,SHmax_unc,phi,R,Aphi,iso,dif,mss,S1,S2,S3,V1x,V1y,V1z,V2x,V2y,V2z,V3x,V3y,V3z,V1pl,V2pl,V3pl,V1azi,V2azi,V3azi) FROM '/home/postgres/CSM/data/%%CSMTB%.csv' DELIMITER ',' CSV HEADER;

COPY Hardebeck_FM_tb(LON,LAT,DEP,See,Sen,Seu,Snn,Snu,Suu,SHmax,SHmax_unc,phi,R,Aphi,iso,dif,mss,S1,S2,S3,V1x,V1y,V1z,V2x,V2y,V2z,V3x,V3y,V3z,V1pl,V2pl,V3pl,V1azi,V2azi,V3azi) FROM '/home/postgres/CSM/data/%%CSMTB%.csv' DELIMITER ',' CSV HEADER;

COPY LovelessMeade_tb(LON,LAT,DEP,See,Sen,Seu,Snn,Snu,Suu,SHmax,SHmax_unc,phi,R,Aphi,iso,dif,mss,S1,S2,S3,V1x,V1y,V1z,V2x,V2y,V2z,V3x,V3y,V3z,V1pl,V2pl,V3pl,V1azi,V2azi,V3azi) FROM '/home/postgres/CSM/data/%%CSMTB%.csv' DELIMITER ',' CSV HEADER;

COPY Luttrell-2017_tb(LON,LAT,DEP,See,Sen,Seu,Snn,Snu,Suu,SHmax,SHmax_unc,phi,R,Aphi,iso,dif,mss,S1,S2,S3,V1x,V1y,V1z,V2x,V2y,V2z,V3x,V3y,V3z,V1pl,V2pl,V3pl,V1azi,V2azi,V3azi) FROM '/home/postgres/CSM/data/%%CSMTB%.csv' DELIMITER ',' CSV HEADER;

COPY NeoKinema_tb(LON,LAT,DEP,See,Sen,Seu,Snn,Snu,Suu,SHmax,SHmax_unc,phi,R,Aphi,iso,dif,mss,S1,S2,S3,V1x,V1y,V1z,V2x,V2y,V2z,V3x,V3y,V3z,V1pl,V2pl,V3pl,V1azi,V2azi,V3azi) FROM '/home/postgres/CSM/data/%%CSMTB%.csv' DELIMITER ',' CSV HEADER;

COPY SAFPoly3D_tb(LON,LAT,DEP,See,Sen,Seu,Snn,Snu,Suu,SHmax,SHmax_unc,phi,R,Aphi,iso,dif,mss,S1,S2,S3,V1x,V1y,V1z,V2x,V2y,V2z,V3x,V3y,V3z,V1pl,V2pl,V3pl,V1azi,V2azi,V3azi) FROM '/home/postgres/CSM/data/%%CSMTB%.csv' DELIMITER ',' CSV HEADER;

COPY SHELLS_tb(LON,LAT,DEP,See,Sen,Seu,Snn,Snu,Suu,SHmax,SHmax_unc,phi,R,Aphi,iso,dif,mss,S1,S2,S3,V1x,V1y,V1z,V2x,V2y,V2z,V3x,V3y,V3z,V1pl,V2pl,V3pl,V1azi,V2azi,V3azi) FROM '/home/postgres/CSM/data/%%CSMTB%.csv' DELIMITER ',' CSV HEADER;

COPY UCERF3_ABM_tb(LON,LAT,DEP,See,Sen,Seu,Snn,Snu,Suu,SHmax,SHmax_unc,phi,R,Aphi,iso,dif,mss,S1,S2,S3,V1x,V1y,V1z,V2x,V2y,V2z,V3x,V3y,V3z,V1pl,V2pl,V3pl,V1azi,V2azi,V3azi) FROM '/home/postgres/CSM/data/%%CSMTB%.csv' DELIMITER ',' CSV HEADER;

COPY YH14-K_tb(LON,LAT,DEP,See,Sen,Seu,Snn,Snu,Suu,SHmax,SHmax_unc,phi,R,Aphi,iso,dif,mss,S1,S2,S3,V1x,V1y,V1z,V2x,V2y,V2z,V3x,V3y,V3z,V1pl,V2pl,V3pl,V1azi,V2azi,V3azi) FROM '/home/postgres/CSM/data/%%CSMTB%.csv' DELIMITER ',' CSV HEADER;

COPY YHSM-2013_tb(LON,LAT,DEP,See,Sen,Seu,Snn,Snu,Suu,SHmax,SHmax_unc,phi,R,Aphi,iso,dif,mss,S1,S2,S3,V1x,V1y,V1z,V2x,V2y,V2z,V3x,V3y,V3z,V1pl,V2pl,V3pl,V1azi,V2azi,V3azi) FROM '/home/postgres/CSM/data/%%CSMTB%.csv' DELIMITER ',' CSV HEADER;

COPY Zeng_tb(LON,LAT,DEP,See,Sen,Seu,Snn,Snu,Suu,SHmax,SHmax_unc,phi,R,Aphi,iso,dif,mss,S1,S2,S3,V1x,V1y,V1z,V2x,V2y,V2z,V3x,V3y,V3z,V1pl,V2pl,V3pl,V1azi,V2azi,V3azi) FROM '/home/postgres/CSM/data/%%CSMTB%.csv' DELIMITER ',' CSV HEADER;

