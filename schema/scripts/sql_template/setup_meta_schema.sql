CREATE TABLE CSM_meta (
   gid           serial PRIMARY KEY,
   model_name    VARCHAR(50) UNIQUE NOT NULL,
   table_name    VARCHAR(50) UNIQUE NOT NULL,
   jblob         VARCHAR(20000) NOT NULL,
   info          VARCHAR(2000) NOT NULL
);
