UPDATE %%csmtb%_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON %%csmtb%_tb USING GIST ("geom");
