UPDATE %%CSMTB%_tb SET geom = ST_SetSRID(ST_MakePoint(LON,LAT),4326); 
CREATE INDEX ON %%CSMTB%_tb USING GIST ("geom");
UPDATE %%CSMTB%_meta SET dataset_name = %%CSMTB%;
UPDATE %%CSMTB%_tb SET meta_gid = select gid from CSM_meta where dataset_name = '%%CSMTB%';
