#####  processing schema/data
#####  since all data is in csv, cp target_data's  target.csv here
#####  iterate through all csv within the data file 
#####  (make sure all  ,NaN, turn into ,,
#####
#####    ./create-sql.sh

PWD=`pwd`

CSMPATH=${PWD}"/../all_CSM_csv_files"

