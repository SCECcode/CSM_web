#!/bin/sh

##
## create db specific sql files
##

. ./common.sh

## if datafiles is not here, then grab them from carc

rm -rf ../sql
mkdir ../sql

## add meta_table
cp sql_template/setup_meta_schema.sql ../sql/setup_schema.sql

for file in ../data/*csv ; do
    [ -e "$file" ] || continue

    filename=${file##*/}
    CSMTB=${filename%.csv}
    echo $CSMTB

    cat $file | sed "s/,NaN,/,,/g" > ../data/$filename

    cat sql_template/linkup_traces.sql | sed "s/%%CSMTB%/${CSMTB}/" >> ../sql/linkup_traces.sql
    cat sql_template/setup_schema.sql | sed "s/%%CSMTB%/${CSMTB}/" >> ../sql/setup_schema.sql
    cat sql_template/setup_csm_tb.sql | sed "s/%%CSMTB%/${CSMTB}/" >> ../sql/setup_csm_tb.sql

## process the metadata
    metafile="../data/"${CSMTB}"_meta.json"
    meta=$(<${metafile})

    echo  "INSERT INTO CSM_meta (\"dataset_name\",\"meta\",\"info\") VALUES ('"${CSMTB}"', '"$meta"', '"${CSMTB}"'); " >> ../sql/setup_meta.sql
   
done
