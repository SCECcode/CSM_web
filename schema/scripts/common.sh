#####  processing schema/data
#####  (make sure all  ,NaN, turn into ,,)
#####
#####    ./process-csv.sh
#####    ./collect-meta.py
#####    ./create-sql.sh

#####   ./process-borehole-csv.sh
#####   ./create-borehole-sql.sh

PWD=`pwd`

CSMPATH=${PWD}"/../all_CSM_csv_files"
BOREHOLEPATH=${PWD}"/../borehole_csv_files"

