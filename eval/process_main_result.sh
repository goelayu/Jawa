#!/bin/bash

# This script processes the final output
# directory and generates storage and performance
# results

script_dir='/vault-home/goelayu/webArchive/scripts'
src_dir='/y/goelayu/webArchive/data/out_dirs/'
result_dir='/vault-home/goelayu/webArchive/results/SOSP21/storage/'
while read site; do 
    echo -n $site" "; cat $result_dir/all_resources/$site | head -n1 | awk '{print "Dedup: ", $0}'
    echo -n $site" "; cat $result_dir/all_resources/$site | tail -n1 | awk '{print "Orig: ", $0}'
    echo -n $site" "; cat $result_dir/js/resources/$site | tail -n1 | awk '{print "System: ", $0}'
    echo -n $site" "; cat $result_dir/js/index/${site} | awk '{c+=$6; s+=$9}END{print "cSizeOrig ", c, "sSizeOrig ", s }'
    echo -n $site" "; cat $result_dir/js/index/${site}.filter | awk '{c+=$7; s+=$10}END{print "cSizeUnion ", c, "sSizeUnion ", s }'
done<$1

