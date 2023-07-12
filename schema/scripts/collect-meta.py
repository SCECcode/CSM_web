#!/usr/bin/env python
##
## collect-meta.py
##
## collect meta data for each dataset from the csv
## 
##  for DEP, less than 50km, grid points are 2km, 
##  for DEP, greater than and equal to 50km, grid points are 5km
##

import sys
from os import walk
import csv
import pdb
import json 
import math
from pathlib import Path
import numpy as np

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

  Overall_Metrics = []
  Overall_Deps = []

# [ { 'dep': val, 'aphi_min': val, 'aphi_max': val, 'cnt': val }, ...] # index = 2
  DEP_range = []
  Overall_data_total = 0

## index starts with 0
# index = 9
  Overall_SHmax_min = None
  Overall_SHmax_max = None 
  Overall_SHmax_range = []

# index = 13
  Overall_Aphi_min = None
  Overall_Aphi_max = None 
  Overall_Aphi_range = []

# index = 14
  Overall_Iso_min = None
  Overall_Iso_max = None 
  Overall_Iso_range = []

# index =15 
  Overall_Dif_min = None
  Overall_Dif_max = None 
  Overall_Dif_range = []

  found = 0
  with open('../data/'+f, encoding="utf8") as f:
    csv_reader = csv.reader(f)
    for line_no, line in enumerate(csv_reader, 1):
        if line_no != 1:
            DEP = math.floor(float(line[2]))

            if(line[9] != "") : ## set if not empty
              SHmax = float(line[9])
            else:
              SHmax = None

            if(line[13] != "") : ## set if not empty
              Aphi = float(line[13])
            else:
              Aphi = None

            if(line[14] != "") : ## set if not empty
              Iso = float(line[14])
            else:
              Iso = None

            if(line[15] != "") : ## set if not empty
              Dif = float(line[15])
            else:
              Dif = None

## DEP
            if (len(DEP_range) == 0) : # first one
              found=0
              nitem={ 'dep': DEP, 'shmax_min': None, 'shmax_max': None, 'aphi_min': None`, 'aphi_max': None, 'iso_min': None, 'iso_max': None, 'dif_min': None, 'dif_max': None, 'cnt': 1, 'raw_shmax': [], 'raw_aphi':[], 'raw_iso':[], 'raw_dif':[] }
              DEP_range.append(nitem)
              Overall_Deps.append(DEP)
            else :
              found=0
              for item in DEP_range:
                 dep=item['dep']
                 if(dep == DEP) : // found it
                   nitem=item;
                   found = 1 
                   break;
              if( found != 0 ) :
                 nitem={ 'dep': DEP, 'shmax_min': None, 'shmax_max': None, 'aphi_min': None`, 'aphi_max': None, 'iso_min': None, 'iso_max': None, 'dif_min': None, 'dif_max': None, 'cnt': 1, 'raw_shmax': [], 'raw_aphi':[], 'raw_iso':[], 'raw_dif':[] }
                 DEP_range.append(nitem)
                 Overall_Deps.append(DEP)
            ## HERE  
            if(SHmax != None) :
              nitem['raw_shmax'].push(SHmax)
            if(Aphi != None) :
              nitem['raw_aphi'].push(Aphi)
            if(Dif != None) :
              nitem['raw_dif'].push(Dif)
            if(Iso != None) :
              nitem['raw_iso'].push(Iso)

### fill in max/min and percentile max/min per depth
            for item in DEP_range:

              raw_shmax = item['raw_shmax']
              item['shmax_min']=shmax_min = np.min(raw_shmax)
              item['shmax_max']=shmax_max = np.max(raw_shmax)

              raw_aphi = item['raw_aphi']
              item['aphi_min']=aphi_min = np.min(raw_aphi)
              item['aphi_max']=aphi_max = np.max(raw_aphi)

              raw_iso = item['raw_iso']
              item['iso_min']=iso_min = np.min(raw_iso)
              item['iso_max']=iso_max = np.max(raw_iso)

              raw_dif = item['raw_dif']
              item['dif_min']=dif_min = np.min(raw_dif)
              item['dif_max']=dif_max = np.max(raw_dif)

## SHmax
            if(Overall_SHmax_min == None || shmax_min < Overall_SHmax_min ):
              Overall_SHmax_min = shmax_min
            if(Overall_SHmax_max == None || shmax_max > Overall_SHmax_max ):
              Overall_SHmax_max = shmax_max
## Aphi
            if(Overall_Aphi_min == None || aphi_min < Overall_Aphi_min ):
              Overall_Aphi_min = aphi_min
            if(Overall_Aphi_max == None || aphi_max > Overall_Aphi_max ):
              Overall_Aphi_max = aphi_max
## Iso 
            if(Overall_Iso_min == None || iso_min < Overall_Iso_min ):
              Overall_Iso_min = iso_min
            if(Overall_Iso_max == None || iso_max > Overall_Iso_max ):
              Overall_Iso_max = iso_max
## Dif 
            if(Overall_Dif_min == None || dif_min < Overall_dif_min ):
              Overall_Dif_min = dif_min
            if(Overall_Dif_max == None || dif_max > Overall_dif_max ):
              Overall_Dif_max = dif_max

            Overall_data_total = line_no - 1

  Overall_SHmax_range= [Overall_SHmax_min, Overall_SHmax_max]
  if ( Overall_SHmax_min != None ):
    Overall_Metrics.append("SHmax") 
  Overall_Aphi_range= [Overall_Aphi_min, Overall_Aphi_max]
  if ( Overall_Aphi_min != None ):
    Overall_Metrics.append("Aphi") 
  Overall_Iso_range= [Overall_Iso_min, Overall_Iso_max]
  if ( Overall_Iso_min != None ):
    Overall_Metrics.append("Iso") 
  Overall_Dif_range= [Overall_Dif_min, Overall_Dif_max]
  if ( Overall_Dif_min != None ):
    Overall_Metrics.append("Dif") 

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
  shmax_min_list = []
  shmax_max_list = []
  aphi_min_list = []
  aphi_max_list = []
  iso_min_list = []
  iso_max_list = []
  dif_min_list = []
  dif_max_list = []
  for item in DEP_range:
    dep=item['dep']
    dep_list.append(dep)
    cnt=item['cnt']
    cnt_list.append(cnt)

    shmax_min=item['shmax_min']
    shmax_max=item['shmax_max']
    shmax_min_list.append(shmax_min)
    shmax_max_list.append(shmax_max)

    aphi_min=item['aphi_min']
    aphi_max=item['aphi_max']
    aphi_min_list.append(aphi_min)
    aphi_max_list.append(aphi_max)

    iso_min=item['iso_min']
    iso_max=item['iso_max']
    iso_min_list.append(iso_min)
    iso_max_list.append(iso_max)

    dif_min=item['dif_min']
    dif_max=item['dif_max']
    dif_min_list.append(dif_min)
    dif_max_list.append(dif_max)

#  print("total data:", Overall_data_total)
#  print("DEP range:", DEP_range)
#  print("dep_list ->", dep_list)
#  print("aphi_min_list ->", aphi_min_list)
#  print("aphi_max_list ->", aphi_max_list)
#  print("cnt_list ->", cnt_list)
#  print("Overall Aphi range:",Overall_Aphi_range)

  f = open('../data/'+f_wo_ext+'_meta.json', 'w')

  jblob=json.loads('{ "model":"'+f_wo_ext+'", "meta": { "dataCount": '+str(Overall_data_total)+' } }')
  jblob['meta']['shmaxRange']=Overall_SHmax_range
  jblob['meta']['aphiRange']=Overall_Aphi_range
  jblob['meta']['isoRange']=Overall_Iso_range
  jblob['meta']['difRange']=Overall_Dif_range
  jblob['meta']['dataByDEP']=DEP_range
  jblob['metric'] = Overall_Metrics
  jblob['depth'] = Overall_Deps
#  jstr=json.dumps(jblob, indent=2)
  jstr=json.dumps(jblob)
  f.write(jstr)
  f.close()

#https://www.statology.org/percentiles-in-python/
#import numpy as np
#make this example reproducible
#np.random.seed(0)
#create array of 100 random integers distributed between 0 and 500
#data = np.random.randint(0, 500, 100)
#find the 37th percentile of the array
#np.percentile(data, 37)
#173.26
#Find the quartiles (25th, 50th, and 75th percentiles) of the array
#np.percentile(data, [25, 50, 75])
#array([116.5, 243.5, 371.5])

### DONE with one file
  print("DONE with one")
  break
              Overall_Deps.append(math.floor(DEP))
            else:  # iterate through and see where to fit them
              found=1
              for item in DEP_range:
                 dep=item['dep']

                 cnt = item['cnt']
                 if(dep == DEP) :
                    found=1
                    item['cnt'] = cnt+1;
                    if(Aphi != None) :
                      item['raw_aphi'].push(Aphi);
                    if(SHmax != None) :
                      item['raw_shmax'].push(SHmax);
                    if(Dif != None) :
                      item['raw_dif'].push(Dif);
                    if(Iso != None) :
                      item['raw_iso'].push(Iso);
                    break

            if(found == 0) :
              nitem={ 'dep': DEP, 'shmax_min': SHmax, 'shmax_max': SHmax, 'aphi_min': Aphi, 'aphi_max': Aphi, 'iso_min': Iso, 'iso_max': Iso, 'dif_min': Dif, 'dif_max': Dif, 'cnt': 1 }
              DEP_range.append(nitem)
              Overall_Deps.append(DEP)

## SHmax
            if(Overall_SHmax_min == None):
              Overall_SHmax_min = Overall_SHmax_max = SHmax
            else :
              if(SHmax != None) :
                if(Overall_SHmax_min == None or SHmax < Overall_SHmax_min) : 
                  Overall_SHmax_min = SHmax
                if(Overall_SHmax_max == None or SHmax > Overall_SHmax_max) :
                  Overall_SHmax_max = SHmax
## Aphi
            if(Overall_Aphi_min == None):
              Overall_Aphi_min = Overall_Aphi_max = Aphi
            else :
              if(Aphi != None) :
                if(Overall_Aphi_min == None or Aphi < Overall_Aphi_min) : 
                  Overall_Aphi_min = Aphi
                if(Overall_Aphi_max == None or Aphi > Overall_Aphi_max) :
                  Overall_Aphi_max = Aphi
## Iso 
            if(Overall_Iso_min == None):
              Overall_Iso_min = Overall_Iso_max = Iso
            else :
              if(Iso != None) :
                if(Overall_Iso_min == None or Iso < Overall_Iso_min) : 
                  Overall_Iso_min = Iso
                if(Overall_Iso_max == None or Iso > Overall_Iso_max) :
                  Overall_Iso_max = Iso

## Dif 
            if(Overall_Dif_min == None):
              Overall_Dif_min = Overall_Dif_max = Dif
            else :
              if(Dif != None) :
                if(Overall_Dif_min == None or Dif < Overall_Dif_min) : 
                  Overall_Dif_min = Dif
                if(Overall_Dif_max == None or Dif > Overall_Dif_max) :
                  Overall_Dif_max = Dif

            Overall_data_total = line_no - 1

  Overall_SHmax_range= [Overall_SHmax_min, Overall_SHmax_max]
  if ( Overall_SHmax_min != None ):
    Overall_Metrics.append("SHmax") 
  Overall_Aphi_range= [Overall_Aphi_min, Overall_Aphi_max]
  if ( Overall_Aphi_min != None ):
    Overall_Metrics.append("Aphi") 
  Overall_Iso_range= [Overall_Iso_min, Overall_Iso_max]
  if ( Overall_Iso_min != None ):
    Overall_Metrics.append("Iso") 
  Overall_Dif_range= [Overall_Dif_min, Overall_Dif_max]
  if ( Overall_Dif_min != None ):
    Overall_Metrics.append("Dif") 

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
  shmax_min_list = []
  shmax_max_list = []
  aphi_min_list = []
  aphi_max_list = []
  iso_min_list = []
  iso_max_list = []
  dif_min_list = []
  dif_max_list = []
  for item in DEP_range:
    dep=item['dep']
    dep_list.append(dep)
    cnt=item['cnt']
    cnt_list.append(cnt)

    shmax_min=item['shmax_min']
    shmax_max=item['shmax_max']
    shmax_min_list.append(shmax_min)
    shmax_max_list.append(shmax_max)

    aphi_min=item['aphi_min']
    aphi_max=item['aphi_max']
    aphi_min_list.append(aphi_min)
    aphi_max_list.append(aphi_max)

    iso_min=item['iso_min']
    iso_max=item['iso_max']
    iso_min_list.append(iso_min)
    iso_max_list.append(iso_max)

    dif_min=item['dif_min']
    dif_max=item['dif_max']
    dif_min_list.append(dif_min)
    dif_max_list.append(dif_max)

#  print("total data:", Overall_data_total)
#  print("DEP range:", DEP_range)
#  print("dep_list ->", dep_list)
#  print("aphi_min_list ->", aphi_min_list)
#  print("aphi_max_list ->", aphi_max_list)
#  print("cnt_list ->", cnt_list)
#  print("Overall Aphi range:",Overall_Aphi_range)

  f = open('../data/'+f_wo_ext+'_meta.json', 'w')

  jblob=json.loads('{ "model":"'+f_wo_ext+'", "meta": { "dataCount": '+str(Overall_data_total)+' } }')
  jblob['meta']['shmaxRange']=Overall_SHmax_range
  jblob['meta']['aphiRange']=Overall_Aphi_range
  jblob['meta']['isoRange']=Overall_Iso_range
  jblob['meta']['difRange']=Overall_Dif_range
  jblob['meta']['dataByDEP']=DEP_range
  jblob['metric'] = Overall_Metrics
  jblob['depth'] = Overall_Deps
  jstr=json.dumps(jblob, indent=2)
#  jstr=json.dumps(jblob)
  f.write(jstr)
  f.close()

#https://www.statology.org/percentiles-in-python/

#np.max
#make this example reproducible
#np.random.seed(0)
#create array of 100 random integers distributed between 0 and 500
#data = np.random.randint(0, 500, 100)
  data=raw_SHmax

#find the 37th percentile of the array
  np.percentile(data, 37)
#173.26
#Find the quartiles (25th, 50th, and 75th percentiles) of the array
  np.percentile(data, [25, 50, 75])
#array([116.5, 243.5, 371.5])

### DONE with one file
  print("DONE with one")
  break
