#!/bin/bash

# This script processes the final output
# directory and generates storage and performance
# results
# set -v

script_dir='/vault-home/goelayu/webArchive/scripts'

src_dir='/x/goelayu/webArchive/data/raw_dirs/storage-mix-large/1m-snapshot/'
proc_dir='/w/goelayu/webArchive/data/'
result_dir='/vault-home/goelayu/webArchive/results/OSDI22/discussion/persistence-network/'
fn_dir='/vault-home/goelayu/webArchive/data/storage-mix-large/1m-snapshot/stats/fns/'
while read crawler; do 
    start=`date +%s`
    echo Executing $crawler
    cd $proc_dir
    
    tar -xf ${src_dir}/${crawler}/${crawler}.performance.tar
    cd $script_dir
    ls ${proc_dir}/${crawler}/performance | while read site; do 
        node quick_scripts/network-persistence.js -n <(cat ${fn_dir}/$crawler | grep $site ) -p  /w/goelayu/webArchive/data/${crawler}/performance &> $result_dir/$site &
    done
    wait $(jobs -p)

    end=`date +%s`
    runtime=$((end-start))
    echo Done launching scripts first $runtime
    cd $proc_dir
    # rm -rf ${crawler} 

    #second time 
    # start=`date +%s`
    # echo Executing $crawler
    # cd $proc_dir
    
    # tar -xf ${src_dir}/${crawler}/${crawler}.performance.tar
    # cd $script_dir
    # node js-formats/file-dedup-network.js -v -n <(cat ${fn_dir}/$crawler | sort -t/ -nk2 | awk -v crawler=$crawler '{print "/w/goelayu/webArchive/data/"crawler"/performance/"$0"/network"}') &> $result_dir/storage/all_resources/$crawler.network
    
    # end=`date +%s`
    # runtime=$((end-start))
    # echo Done launching scripts second $runtime
    # cd $proc_dir
    # rm -rf ${crawler}
done<$1