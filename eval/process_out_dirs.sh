#!/bin/bash

# This script processes the final output
# directory and generates storage and performance
# results
set -v

script_dir='/vault-home/goelayu/webArchive/scripts'
src_dir='/y/goelayu/webArchive/data/out_dirs/'
raw_dir='/x/goelayu/webArchive/data/raw_dirs/'
result_dir='/vault-home/goelayu/webArchive/results/SOSP21/eval'
while read site; do 
    echo Executing site $site: ${src_dir}/${site}.tar 
    # cp ${_src_dir}/${site}.tar ${src_dir}
    # echo Done moving tar, extracing
    start=`date +%s`
    # tar xf ${src_dir}/${site}.tar -C ${raw_dir}
    end=`date +%s`
    echo Done extracting tar in time: $((end-start))
    cd $script_dir
    node all-mime-storage.js -d $raw_dir/$site/instOutput -u <(cat /vault-home/goelayu/webArchive//data/500k/stats/fns/$site | cut -d/ -f2,3 ) \
    -o $result_dir/storage/pageMD/${site}.other &> $result_dir/storage/all_resources/$site
    node --max-old-space-size=20000 js-formats/fn-cmp.js -d $raw_dir/$site/instOutput/ -u <(cat /vault-home/goelayu/webArchive//data/500k/stats/fns/$site| cut -d/ -f2,3 | sort -t/ -nk2 ) \
    -v -p $raw_dir/$site/performance/ -o $result_dir/storage/pageMD/$site &> $result_dir/storage/js/resources/$site && \
    node index-lookups.js --jd $result_dir/storage/pageMD/$site --alld $result_dir/storage/pageMD/${site}.other --src $raw_dir/$site/instOutput &> $result_dir/storage/js/index/$site &
    node --max-old-space-size=20000 js-formats/fn-cmp.js -d $raw_dir/$site/instOutput/ -u <(cat /vault-home/goelayu/webArchive//data/500k/stats/fns/$site| cut -d/ -f2,3 | sort -t/ -nk2 ) \
    -v -p $raw_dir/$site/performance/ -o $result_dir/storage/pageMD/${site}.filter --filter &> $result_dir/storage/js/resources/${site}.filter && \
    node index-lookups.js --jd $result_dir/storage/pageMD/${site}.filter --alld $result_dir/storage/pageMD/${site}.other --src $raw_dir/$site/instOutput &> $result_dir/storage/js/index/${site}.filter &
    echo Done launching scripts, Running in bg $site
    echo Waiting for bg jobs
    wait $(jobs -p)
    # echo Cleaning up sites
    # rm -r ${src_dir}/${site}.tar ${src_dir}/${site}
done<$1

# echo 'Waiting for background jobs to finish'
# wait $(jobs -p)
# echo 'Done'