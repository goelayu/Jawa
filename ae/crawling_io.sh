#! /bin/bash


original=`cat ../data/results/storage/pagemd/nofilter | jq '.[].cWrites.orig' | median`
jawa=`cat ../data/results/storage/pagemd/filter | jq '.[].cWrites.union' | median`

jawa_f=`echo $jawa | cut -d' ' -f1`
orig_f=`echo $original | cut -d' ' -f1`

jawa_s=`echo $jawa | cut -d' ' -f2`
orig_s=`echo $original | cut -d' ' -f2`

echo "**********Crawling IO**************"

echo "Reductions in Crawling IO (50th percentile)": $(echo $orig_f  $jawa_f | awk '{print $1 - $2}' )
echo "Reductions in Crawling IO (95th percentile)": $(echo $orig_s  $jawa_s | awk '{print $1 - $2}' )