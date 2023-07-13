#!/usr/bin/env python
##
## collect-meta.py
##
## collect meta data for each dataset from the csv
## 
##  for DEP, less than 50km, grid points are 2km, 
##  for DEP, greater than and equal to 50km, grid points are 5km
##
## SHmax should be fixed at [-90,90] (currently still drawing from data)
## Aphi should be fixed at [0,3] (currently still drawing from data)
## Iso should be [min,max], or better yet [0.001 quantile – 0.999 quantile],
## though for stressing rate models (LovelessMeade, NeoKinema, SAFPoly3D,
## UCERF_ABM, Zeng) it would also help for it to be symmetric about zero.
## Dif should be [min,max], or better yet [0.001 quantile – 0.999 quantile]

import sys
from os import walk
import csv
import json 
import math
from pathlib import Path
import numpy as np
import pdb

## extract meta data info from the csv file
##
file_list = []
for (dirpath, dirnames, filenames) in walk("../data"):
    file_list.extend(filenames)
    break

#file_list = ['FlatMaxwell.csv']

for f in file_list:
  ff = Path(f)
  f_wo_ext = str(ff.with_suffix(''))
  sfx=ff.suffix
  if(sfx != ".csv") :
    continue

  print("collect-meta file:",f) 

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
              nitem={ 'dep': DEP, 'shmax_min': None, 'shmax_max': None, 'aphi_min': None, 'aphi_max': None, 'iso_min': None, 'iso_max': None, 'dif_min': None, 'dif_max': None, 'cnt': 1, 'rawshmax': [], 'rawaphi':[], 'rawiso':[], 'rawdif':[] }
              DEP_range.append(nitem)
              Overall_Deps.append(DEP)
            else :
              found=0
              for item in DEP_range:
                 dep=item['dep']
                 if(dep == DEP) : # found it
                   nitem=item;
                   found = 1 
                   break;
              if( found == 0 ) :
                 nitem={ 'dep': DEP, 'shmax_min': None, 'shmax_max': None, 'aphi_min': None, 'aphi_max': None, 'iso_min': None, 'iso_max': None, 'dif_min': None, 'dif_max': None, 'cnt': 1, 'rawshmax': [], 'rawaphi':[], 'rawiso':[], 'rawdif':[] }
                 DEP_range.append(nitem)
                 Overall_Deps.append(DEP)

            ## HERE  
            if(SHmax != None) :
              nitem['rawshmax'].append(SHmax)
            if(Aphi != None) :
              nitem['rawaphi'].append(Aphi)
            if(Dif != None) :
              nitem['rawdif'].append(Dif)
            if(Iso != None) :
              nitem['rawiso'].append(Iso)

### fill in max/min and percentile max/min per depth
    for item in DEP_range:
      rawshmax = item['rawshmax']
      shmax_min=shmax_max=None
      if(np.array(rawshmax).size > 0) :
          item['shmax_min']=shmax_min = np.min(rawshmax)
          item['shmax_max']=shmax_max = np.max(rawshmax)
    
      rawaphi = item['rawaphi']
      aphi_min=aphi_max=None
      if(np.array(rawaphi).size > 0) :
          item['aphi_min']=aphi_min = np.min(rawaphi)
          item['aphi_max']=aphi_max = np.max(rawaphi)

      rawiso = item['rawiso']
      iso_min=iso_max=iso_90p=iso_10p=iso_999q=iso_001q=iso_999qs=iso_001qs=None
      if(np.array(rawiso).size > 0) :
          item['iso_min']=iso_min = np.min(rawiso)
          item['iso_max']=iso_max = np.max(rawiso)
          item['iso_90p']=iso_90p = np.percentile(rawiso, 90)
          item['iso_10p']=iso_10p = np.percentile(rawiso, 10)
          item['iso_999q']=iso_999q = np.quantile(rawiso, .999)
          item['iso_001q']=iso_001q = np.quantile(rawiso, .001)
## only if iso_001q is smaller than 0
          if(iso_001q < 0 and iso_999q > 0) :
            d999=abs(iso_999q - 0)
            d001=abs(iso_001q - 0)
            if(d999 > d001) :
              delta=d999
              iso_999qs=iso_999q
              if(iso_001q < 0) :
                iso_001qs= 0-delta
              else:
                print(" BAD iso 1???")
            else: 
              delta=d001
              iso_001qs=iso_001q
              if(iso_999q > 0) :
                iso_999qs=delta;
              else:
                print(" BAD iso 1???")
            item['iso_999qs']=iso_999qs
            item['isoi_001qs']=iso_001qs
        
      rawdif = item['rawdif']
      dif_min=dif_max=dif_90p=dif_10p=dif_999q=dif_001q=None
      if(np.array(rawdif).size > 0) :
          item['dif_min']=dif_min = np.min(rawdif)
          item['dif_max']=dif_max = np.max(rawdif)
          item['dif_90p']=dif_90p = np.percentile(rawdif, 90)
          item['dif_10p']=dif_10p = np.percentile(rawdif, 10)
          item['dif_999q']=dif_999q = np.quantile(rawdif, .999)
          item['dif_001q']=dif_001q = np.quantile(rawdif, .001)

## SHmax
      if(Overall_SHmax_min == None or shmax_min < Overall_SHmax_min ):
        Overall_SHmax_min = shmax_min
      if(Overall_SHmax_max == None or shmax_max > Overall_SHmax_max ):
        Overall_SHmax_max = shmax_max
## Aphi
      if(Overall_Aphi_min == None or aphi_min < Overall_Aphi_min ):
        Overall_Aphi_min = aphi_min
      if(Overall_Aphi_max == None or aphi_max > Overall_Aphi_max ):
        Overall_Aphi_max = aphi_max
## Iso 
      if(Overall_Iso_min == None or iso_min < Overall_Iso_min ):
        Overall_Iso_min = iso_min
      if(Overall_Iso_max == None or iso_max > Overall_Iso_max ):
        Overall_Iso_max = iso_max
## Dif 
      if(Overall_Dif_min == None or dif_min < Overall_Dif_min ):
        Overall_Dif_min = dif_min
      if(Overall_Dif_max == None or dif_max > Overall_Dif_max ):
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

  ## remove rawshmax, rawaphi, rawiso, rawdif
  for item in DEP_range :
     del item['rawshmax'] 
     del item['rawaphi'] 
     del item['rawiso'] 
     del item['rawdif'] 

  jblob['meta']['dataByDEP']=DEP_range

  jblob['metric'] = Overall_Metrics
  jblob['depth'] = Overall_Deps
#  jstr=json.dumps(jblob, indent=2)
  jstr=json.dumps(jblob)
  f.write(jstr)
  f.close()
