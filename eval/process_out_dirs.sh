#!/bin/bash

# This script processes the final output
# directory and generates storage and performance
# results

script_dir='/vault-home/goelayu/webArchive/scripts'
src_dir='/y/goelayu/webArchive/data/out_dirs/'
result_dir='/vault-home/goelayu/webArchive/results/SOSP21/'
while read site; do 
    echo Executing site $site
    cd $script_dir
    node all-mime-storage.js -d $src_dir/$site/instOutput -u <(cat /vault-home/goelayu/webArchive//data/500k/stats/fns/$site | cut -d/ -f2,3 ) \
    -o $result_dir/storage/pageMD/${site}.other &> $result_dir/storage/all_resources/$site
    node --max-old-space-size=20000 js-formats/fn-cmp.js -d $src_dir/$site/instOutput/ -u <(cat /vault-home/goelayu/webArchive//data/500k/stats/fns/$site| cut -d/ -f2,3 | sort -t/ -nk2 ) \
    -v -p $src_dir/$site/performance/ -o $result_dir/storage/pageMD/$site &> $result_dir/storage/js/resources/$site && \
    node index-lookups.js --jd $result_dir/storage/pageMD/$site --alld $result_dir/storage/pageMD/${site}.other --src $src_dir/$site/instOutput &> $result_dir/storage/js/index/$site &
    node --max-old-space-size=20000 js-formats/fn-cmp.js -d $src_dir/$site/instOutput/ -u <(cat /vault-home/goelayu/webArchive//data/500k/stats/fns/$site| cut -d/ -f2,3 | sort -t/ -nk2 ) \
    -v -p $src_dir/$site/performance/ -o $result_dir/storage/pageMD/${site}.filter --filter &> $result_dir/storage/js/resources/${site}.filter && \
    node index-lookups.js --jd $result_dir/storage/pageMD/${site}.filter --alld $result_dir/storage/pageMD/${site}.other --src $src_dir/$site/instOutput &> $result_dir/storage/js/index/${site}.filter &
    echo Done launching scripts, Running in bg $site
done<$1

echo 'Waiting for background jobs to finish'
wait $(jobs -p)
echo 'Done'