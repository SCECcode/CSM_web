#!/bin/sh

##
## create db specific sql files
##

. ./common.sh

## if datafiles is not here, then grab them from carc

rm -rf sql
mkdir sql

for file in $CSMPATH/*csv ; do
    [ -e "$file" ] || continue
    echo $file

    filename=${file##*/}
    echo $filename
    CSMTB=${filename%.csv}
    echo $CSMTB

    cat $file | sed "s/,NaN,/,,/g" > ../data/$filename

    cat sql_template/linkup_traces.sql | sed "s/%%CSMTB%/${CSMTB}/" >> sql/linkup_traces.sql
    cat sql_template/setup_schema.sql | sed "s/%%CSMTB%/${CSMTB}/" >> sql/setup_schema.sql
    cat sql_template/setup_csm_tb.sql | sed "s/%%CSMTB%/${CSMTB}/" >> sql/setup_csm_tb.sql
done
