#!/bin/bash
# This script instruments and then runs pages 
# for the given sites

src_dir='/w/goelayu/webArchive/data'

static_cmd_dir='/vault-home/goelayu/webArchive/data/500k/stats/static_cmds'
filter_cmd_dir='/vault-home/goelayu/webArchive/data/500k/stats/filter_cmds'


fin_tars_dir='/vault-home/goelayu/webArchive/data/500k/fin_tars'

#  change directory to SSD
cd /w/goelayu/webArchive/data/sites/

process_out_dir(){
    #copy code from process out dir script here
    script_dir='/vault-home/goelayu/webArchive/scripts'
    _src_dir='/y/goelayu/webArchive/data/out_dirs/'
    src_dir='/w/goelayu/webArchive/data/sites/'
    result_dir='/vault-home/goelayu/webArchive/results/SOSP21/'

    site=$1
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
    echo Waiting for bg jobs
    wait $(jobs -p)
}

while read site; do 
    startM=`date +%s`
    cd /w/goelayu/webArchive/data/sites/
    echo 'Copying tar for site', $site
    # #extract the tar
    tar -I pigz -xf ../out_tars/${site}.tar.out.pigz
    echo 'done extracting tar'
    echo 'Launching filter script'

    start=`date +%s`
    cd /vault-home/goelayu/webArchive/program_analysis
    cat ${filter_cmd_dir}/${site} | parallel --max-proc 30 &> /vault-home/goelayu/webArchive/logs/filter_files/${site}
    end=`date +%s`
    runtime=$((end-start))
    echo 'done generating filter files in time: ', $runtime 
    echo 'Launch static analysis parallel script'
    start=`date +%s`
    # # run inst commands in program_analysis directory
    cd /vault-home/goelayu/webArchive/program_analysis/analyzers/
    cat ${static_cmd_dir}/${site} | parallel --max-proc 30 &> /vault-home/goelayu/webArchive/logs/static_analysis/${site}
    end=`date +%s`
    runtime=$((end-start))
    echo 'done launching static analysis commands from in time: ', $runtime
    process_out_dir $site
    cd /w/goelayu/webArchive/data/sites/
    # tar -zcf /vault-home/goelayu/webArchive/data/500k/out_tars/${site}.tar.gz ${site} && rm -r ${site} &
    # tar cf /y/goelayu/webArchive/data/out_dirs/${site}.tar ${site} && rm -r ${site}
    mv ${site} /x/goelayu/webArchive/data/raw_dirs/
    # mv ${site}.tar /y/goelayu/webArchive/data/out_dirs/
    echo 'Site ' $site, ' finished...'
    endM=`date +%s`
    runtime=$((endM-startM))
    echo 'Processing ', $site, ' took ', $runtime ' seconds' 
done<$1