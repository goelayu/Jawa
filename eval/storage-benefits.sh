#!/bin/bash
# This script is used to break down the 
# storage benefits by computing what
# fraction of bytes are executed in a single load, vs  all loads 
# of client characteristics. 

# $1 -> list of sites

result_dir="/vault-home/goelayu/webArchive/results/OSDI22/eval/storage/expln/concolic_coverage/"
single_res="/vault-home/goelayu/webArchive/results/OSDI22/eval/storage/expln/single_load"

getSingleRes(){
    res=`cat $single_res | grep $1 | awk '{if (NF == 3 && $2 != 0 && $3/$2 > 0.01) print $3*100/$2}'`;
    echo $1 $res $res
}

while read site; do 
    single_perc=`cat ${result_dir}/${site} | grep "Single Load Coverage" | cut -d' ' -f6 | cut -d'%' -f1`
    all_perc=`cat ${result_dir}/${site} | grep "(Greedy+Symbolic)" |  grep Loads | cut -d' ' -f7 | cut -d% -f1`;
    if [[ $single_perc == "" || $all_perc == "" ]]; then
        # echo $site "No data"
        getSingleRes $site
        continue;
    fi
    if (( $(echo "$single_perc > $all_perc" | bc -l) )); then
        echo $single_perc $single_perc
    else echo "$site $single_perc $all_perc"
    fi
done<$1