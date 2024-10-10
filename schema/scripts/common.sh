#####  processing schema/data
#####  (make sure all  ,NaN, turn into ,,)
#####
#####    rm -rf ../data
#####    mkdir ../data
#####    ./process-csv.sh
#####    ./collect-meta.py
#####    ./create-sql.sh

PWD=`pwd`

CSMPATH=${PWD}"/../all_CSM_csv_files"
#BOREHOLEPATH=${PWD}"/../borehole_csv_files"

