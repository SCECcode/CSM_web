#!/bin/sh
##
## create-sql.sh
##
## create db specific sql files
##

. ./common.sh

## if datafiles is not here, then grab them from carc

rm -rf ../sql
mkdir ../sql

## add meta_table
cp sql_template/setup_meta_schema.sql ../sql/setup_meta_schema.sql

for file in ../data/*csv ; do

    filename=${file##*/}
    CSMTB=${filename%.csv}
    csmtb=`echo $CSMTB | awk '{ print tolower($1) }'`

    cat sql_template/linkup_traces.sql | sed "s/%%CSMTB%/${CSMTB}/g" | sed "s/%%csmtb%/${csmtb}/g" >> ../sql/linkup_traces.sql
    cat sql_template/setup_model_schema.sql | sed "s/%%CSMTB%/${CSMTB}/g" | sed "s/%%csmtb%/${csmtb}/g" >> ../sql/setup_model_schema.sql
    cat sql_template/setup_model_tb.sql | sed "s/%%CSMTB%/${CSMTB}/g" | sed "s/%%csmtb%/${csmtb}/g" >> ../sql/setup_model_tb.sql

## process the metadata
    metafile="../data/"${CSMTB}"_meta.json"
    meta=$(<${metafile})

    cat sql_template/setup_meta_tb.sql | sed "s/%%CSMTB%/${CSMTB}/g" | sed "s/%%csmtb%/${csmtb}/g" | sed "s/%%meta%/${meta}/g" >> ../sql/setup_meta_tb.sql


done
