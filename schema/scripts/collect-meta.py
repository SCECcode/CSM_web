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

# index = 2,  [ { 'dep': val, 'aphi_min': val, 'aphi_max': val, 'cnt': val }, ...]
  DEP_range = []
# index = 13
  Overall_data_total = 0
  Overall_Alphi_min = None
  Overall_Alphi_max = None 
  Overall_Alphi_range = []
  found = 0

  with open('../data/'+f, encoding="utf8") as f:
    csv_reader = csv.reader(f)
    for line_no, line in enumerate(csv_reader, 1):
        if line_no != 1:
            DEP = float(line[2])
            if(line[13] != "") : ## set if not empty
              Alphi = float(line[13])
            else:
              Alphi = None

## DEP
            if (len(DEP_range) == 0) : # first one
              found=1
              nitem={ 'dep': DEP, 'aphi_min': Alphi, 'aphi_max': Alphi, 'cnt': 1 }
              DEP_range.append(nitem)
            else:  # iterate through and see where to fit them
              found=0
              for item in DEP_range:
                 dep=item['dep']
                 aphi_min=item['aphi_min']
                 aphi_max=item['aphi_max']
                 cnt = item['cnt']
                 if(dep == DEP) :
                    found=1
                    item['cnt'] = cnt+1;
                    if(Alphi != None) :
                      if (aphi_min == None or Alphi < aphi_min) :
                         item['aphi_min'] = Alphi;
                      if (aphi_max == None or Alphi > aphi_max) :
                         item['aphi_max'] = Alphi;
                    break
            if(found == 0) :
              nitem={ 'dep': DEP, 'aphi_min': Alphi, 'aphi_max': Alphi, 'cnt': 1  }
              DEP_range.append(nitem)
## Alphi
            if(Overall_Alphi_min == None):
              Overall_Alphi_min = Overall_Alphi_max = Alphi
            else :
              if(Alphi != None) :
                if(Overall_Alphi_min == None or Alphi < Overall_Alphi_min) : 
                  Overall_Alphi_min = Alphi
                if(Overall_Alphi_max == None or Alphi > Overall_Alphi_max) :
                  Overall_Alphi_max = Alphi
            Overall_data_total = line_no - 1

  Overall_Alphi_range= [Overall_Alphi_min, Overall_Alphi_max]

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
  aphi_min_list = []
  aphi_max_list = []
  cnt_list = []
  verify_total = 0
  for item in DEP_range:
    dep=item['dep']
    aphi_min=item['aphi_min']
    aphi_max=item['aphi_max']
    cnt=item['cnt']
    dep_list.append(dep)
    aphi_min_list.append(aphi_min)
    aphi_max_list.append(aphi_max)
    cnt_list.append(cnt)
    verify_total = verify_total + cnt;

#  print("total data:", Overall_data_total)
#  print("verify total data:", verify_total)
#  print("DEP range:", DEP_range)
#  print("dep_list ->", dep_list)
#  print("aphi_min_list ->", aphi_min_list)
#  print("aphi_max_list ->", aphi_max_list)
#  print("cnt_list ->", cnt_list)
#  print("Overall Alphi range:",Overall_Alphi_range)

  f = open('../data/'+f_wo_ext+'_meta.json', 'w')
  jblob=json.loads('{ "model":"'+f_wo_ext+'", "meta": { "dataCount": '+str(Overall_data_total)+' } }')
  jblob['meta']['aphiRange']=Overall_Alphi_range
  jblob['meta']['dataByDEP']=DEP_range
  jblob['metric'] = [ 'aphi' ] 
#  jstr=json.dumps(jblob, indent=2)
  jstr=json.dumps(jblob)
  f.write(jstr)
  f.close()

