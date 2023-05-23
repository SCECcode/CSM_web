CREATE TABLE CSM_meta (
   gid           serial PRIMARY KEY,
   dataset_name  VARCHAR(30) UNIQUE NOT NULL,
   meta          VARCHAR(2000) NOT NULL,
   info          VARCHAR(2000) NOT NULL
);
