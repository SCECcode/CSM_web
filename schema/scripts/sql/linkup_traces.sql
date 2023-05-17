UPDATE FlatMaxwell_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON FlatMaxwell_tb USING GIST ("geom");
UPDATE FlatMaxwell_tb SET dataset = %%CSMTB%;

UPDATE Hardebeck_FM_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON Hardebeck_FM_tb USING GIST ("geom");
UPDATE Hardebeck_FM_tb SET dataset = %%CSMTB%;

UPDATE LovelessMeade_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON LovelessMeade_tb USING GIST ("geom");
UPDATE LovelessMeade_tb SET dataset = %%CSMTB%;

UPDATE Luttrell-2017_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON Luttrell-2017_tb USING GIST ("geom");
UPDATE Luttrell-2017_tb SET dataset = %%CSMTB%;

UPDATE NeoKinema_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON NeoKinema_tb USING GIST ("geom");
UPDATE NeoKinema_tb SET dataset = %%CSMTB%;

UPDATE SAFPoly3D_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON SAFPoly3D_tb USING GIST ("geom");
UPDATE SAFPoly3D_tb SET dataset = %%CSMTB%;

UPDATE SHELLS_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON SHELLS_tb USING GIST ("geom");
UPDATE SHELLS_tb SET dataset = %%CSMTB%;

UPDATE UCERF3_ABM_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON UCERF3_ABM_tb USING GIST ("geom");
UPDATE UCERF3_ABM_tb SET dataset = %%CSMTB%;

UPDATE YH14-K_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON YH14-K_tb USING GIST ("geom");
UPDATE YH14-K_tb SET dataset = %%CSMTB%;

UPDATE YHSM-2013_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON YHSM-2013_tb USING GIST ("geom");
UPDATE YHSM-2013_tb SET dataset = %%CSMTB%;

UPDATE Zeng_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON Zeng_tb USING GIST ("geom");
UPDATE Zeng_tb SET dataset = %%CSMTB%;

