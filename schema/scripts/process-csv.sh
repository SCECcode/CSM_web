#!/bin/sh
##
## process-csv.sh
##
## process a simple csv from user supplied csv
## trim off the extended header from the original csv file
##

. ./common.sh

rm -rf ../data
mkdir ../data

for file in $CSMPATH/*csv ; do
    [ -e "$file" ] || continue
    echo "process-csv.sh: " $file

    filename=${file##*/}
    CSMTB=${filename%.csv}

## remove #-lines
## put in the csv header row 

    cp ./csv_header ../data/$filename
    awk 'NR > 48' $file | sed "s/,NaN,/,,/g" > ../data/$filename

done
