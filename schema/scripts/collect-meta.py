#!/usr/bin/env python
##
## collect-meta.py
##
## collect meta data for each dataset from the csv
##

import sys
from os import walk
import csv
import pdb
import json 
from pathlib import Path

## extract meta data info from the csv file
##
file_list = []
for (dirpath, dirnames, filenames) in walk("../data"):
    file_list.extend(filenames)
    break

for f in file_list:
  ff = Path(f)
  f_wo_ext = str(ff.with_suffix(''))
  sfx=ff.suffix
  if(sfx != ".csv") :
    continue

  print("file:",f) 

# [ { 'dep': val, 'aphi_min': val, 'aphi_max': val, 'cnt': val }, ...] # index = 2
  DEP_range = []
  Overall_data_total = 0
# index = 13
  Overall_Aphi_min = None
  Overall_Aphi_max = None 
  Overall_Aphi_range = []
# index = 19 
  Overall_S3_min = None
  Overall_S3_max = None 
  Overall_S3_range = []

  found = 0
  with open('../data/'+f, encoding="utf8") as f:
    csv_reader = csv.reader(f)
    for line_no, line in enumerate(csv_reader, 1):
        if line_no != 1:
            DEP = float(line[2])
            if(line[13] != "") : ## set if not empty
              Aphi = float(line[13])
            else:
              Aphi = None

            if(line[19] != "") : ## set if not empty
              S3 = float(line[19])
            else:
              S3 = None

## DEP
            if (len(DEP_range) == 0) : # first one
              found=1
              nitem={ 'dep': DEP, 'aphi_min': Aphi, 'aphi_max': Aphi, 's3_min': S3, 's3_max': S3, 'cnt': 1 }
              DEP_range.append(nitem)
            else:  # iterate through and see where to fit them
              found=0
              for item in DEP_range:
                 dep=item['dep']
                 aphi_min=item['aphi_min']
                 aphi_max=item['aphi_max']
                 s3_min=item['s3_min']
                 s3_max=item['s3_max']
                 cnt = item['cnt']
                 if(dep == DEP) :
                    found=1
                    item['cnt'] = cnt+1;
                    if(Aphi != None) :
                      if (aphi_min == None or Aphi < aphi_min) :
                         item['aphi_min'] = Aphi;
                      if (aphi_max == None or Aphi > aphi_max) :
                         item['aphi_max'] = Aphi;
                      if (s3_min == None or S3 < s3_min) :
                         item['s3_min'] = S3;
                      if (s3_max == None or S3 > s3_max) :
                         item['s3_max'] = S3;
                    break
            if(found == 0) :
              nitem={ 'dep': DEP, 'aphi_min': Aphi, 'aphi_max': Aphi, 's3_min': S3, 's3_max': S3, 'cnt': 1 }
              DEP_range.append(nitem)
## Aphi
            if(Overall_Aphi_min == None):
              Overall_Aphi_min = Overall_Aphi_max = Aphi
            else :
              if(Aphi != None) :
                if(Overall_Aphi_min == None or Aphi < Overall_Aphi_min) : 
                  Overall_Aphi_min = Aphi
                if(Overall_Aphi_max == None or Aphi > Overall_Aphi_max) :
                  Overall_Aphi_max = Aphi
## S3
            if(Overall_S3_min == None):
              Overall_S3_min = Overall_S3_max = S3
            else :
              if(S3 != None) :
                if(Overall_S3_min == None or S3 < Overall_S3_min) : 
                  Overall_S3_min = S3
                if(Overall_S3_max == None or S3 > Overall_S3_max) :
                  Overall_S3_max = S3

            Overall_data_total = line_no - 1

  Overall_Aphi_range= [Overall_Aphi_min, Overall_Aphi_max]
  Overall_S3_range= [Overall_S3_min, Overall_S3_max]

#  {
#      "meta": {
#          "dataCount": 974704,
#          "dataByDEP": [ {'dep': 1.0, 'aphi_min': 0.078, 'aphi_max': 2.975, 'cnt': 72325}, 
#                         {'dep': 3.0, 'aphi_min': 0.079, 'aphi_max': 2.936, 'cnt': 72325}, 
#                         ...
#                       ],
#          "aphiRange" : [0.001, 2.998],
#          "metric" : [ 'alpha' ]
#          }
#  }

## break it up
  dep_list = []
  cnt_list = []
  aphi_min_list = []
  aphi_max_list = []
  s3_min_list = []
  s3_max_list = []
  for item in DEP_range:
    dep=item['dep']
    dep_list.append(dep)
    cnt=item['cnt']
    cnt_list.append(cnt)

    aphi_min=item['aphi_min']
    aphi_max=item['aphi_max']
    aphi_min_list.append(aphi_min)
    aphi_max_list.append(aphi_max)

    s3_min=item['s3_min']
    s3_max=item['s3_max']
    s3_min_list.append(s3_min)
    s3_max_list.append(s3_max)

#  print("total data:", Overall_data_total)
#  print("DEP range:", DEP_range)
#  print("dep_list ->", dep_list)
#  print("aphi_min_list ->", aphi_min_list)
#  print("aphi_max_list ->", aphi_max_list)
#  print("cnt_list ->", cnt_list)
#  print("Overall Aphi range:",Overall_Aphi_range)

  f = open('../data/'+f_wo_ext+'_meta.json', 'w')
  jblob=json.loads('{ "model":"'+f_wo_ext+'", "meta": { "dataCount": '+str(Overall_data_total)+' } }')
  jblob['meta']['aphiRange']=Overall_Aphi_range
  jblob['meta']['s3Range']=Overall_S3_range
  jblob['meta']['dataByDEP']=DEP_range
  jblob['metric'] = [ 'aphi', 's3' ] 
  jstr=json.dumps(jblob, indent=2)
#  jstr=json.dumps(jblob)
  f.write(jstr)
  f.close()

