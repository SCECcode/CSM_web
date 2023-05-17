UPDATE %%CSMTB%_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON %%CSMTB%_tb USING GIST ("geom");
UPDATE %%CSMTB%_tb SET dataset = %%CSMTB%;

