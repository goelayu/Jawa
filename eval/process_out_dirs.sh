#!/bin/bash

# This script processes the final output
# directory and generates storage and performance
# results
# set -v

script_dir='/vault-home/goelayu/webArchive/scripts'
# src_dir='/y/goelayu/webArchive/data/out_dirs/'
# raw_dir='/x/goelayu/webArchive/data/raw_dirs/'
# result_dir='/vault-home/goelayu/webArchive/results/OSDI22/eval'

src_dir='/x/goelayu/webArchive/data/raw_dirs/storage-mix-large/1m-snapshot/'
proc_dir='/w/goelayu/webArchive/data/'
result_dir='/vault-home/goelayu/webArchive/results/OSDI22/eval/storage/mix'
fn_dir='/vault-home/goelayu/webArchive/data/storage-mix-large/1m-snapshot/stats/fns/'
while read crawler; do 
    start=`date +%s`
    echo Executing $crawler
    cd $proc_dir
    
    tar -xf ${src_dir}/${crawler}/${crawler}.performance.tar
    tar -xf ${src_dir}/${crawler}/${crawler}.instOutput.tar
    find . -iname allFns | cut -d/ -f4,5,6 > ${fn_dir}/$crawler
    cd $script_dir
    node all-mime-storage.js -v -d $proc_dir/$crawler/instOutput -u <(cat ${fn_dir}/$crawler) \
    -o $result_dir/storage/pageMD/${crawler}.other &> $result_dir/storage/all_resources/$crawler
    node --max-old-space-size=20000 js-formats/fn-cmp.js -v -d $proc_dir/$crawler/instOutput/ -u <(cat ${fn_dir}/$crawler | sort -t/ -nk2  ) \
    -v -p $proc_dir/$crawler/performance/ -o $result_dir/storage/pageMD/$crawler &> $result_dir/storage/js/resources/$crawler && \
    node quick_scripts/index-lookups.js --jd $result_dir/storage/pageMD/$crawler --alld $result_dir/storage/pageMD/${crawler}.other --src $proc_dir/$crawler/instOutput &> $result_dir/storage/js/index/$crawler &
    # node --max-old-space-size=20000 js-formats/fn-cmp.js -d $raw_dir/$site/instOutput/ -u <(cat /vault-home/goelayu/webArchive//data/500k/stats/fns/$site| cut -d/ -f2,3 | sort -t/ -nk2 ) \
    # -v -p $raw_dir/$site/performance/ -o $result_dir/storage/pageMD/${site}.filter --filter &> $result_dir/storage/js/resources/${site}.filter && \
    # node index-lookups.js --jd $result_dir/storage/pageMD/${site}.filter --alld $result_dir/storage/pageMD/${site}.other --src $raw_dir/$site/instOutput &> $result_dir/storage/js/index/${site}.filter &
    
    end=`date +%s`
    runtime=$((end-start))
    echo Done launching scripts, $runtime
    wait $(jobs -p)
#     # echo Cleaning up sites
#     # rm -r ${src_dir}/${site}.tar ${src_dir}/${site}
done<$1

# echo 'Waiting for background jobs to finish'
# wait $(jobs -p)
# echo 'Done'

src_dir='/x/goelayu/webArchive/data/raw_dirs/storage-mix-large/500k-snapshot/'
proc_dir='/w/goelayu/webArchive/data/'
result_dir='/vault-home/goelayu/webArchive/results/OSDI22/misc/500k-snapshot/storage'
while read crawler; do 
    echo Executing $crawler
    cd $proc_dir
    # tar -xf ${src_dir}/${crawler}/${crawler}.performance.tar
    # tar -xf ${src_dir}/${crawler}/${crawler}.instOutput.tar
    cd $script_dir

    node --max-old-space-size=20000 js-formats/fn-cmp.js -d $proc_dir/$crawler/instOutput/ -u <( cd $proc_dir && find . -iname allFns | cut -d/ -f4,5,6) \
    -v -p $proc_dir/$crawler/performance/ &> $result_dir//$crawler

    #cleanup
    cd $proc_dir
    rm -r $crawler

done<$1