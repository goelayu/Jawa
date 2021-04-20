#!/bin/bash
# This script instruments and then runs pages 
# for the given sites

src_dir='/w/goelayu/webArchive/data'

static_cmd_dir='/vault-home/goelayu/webArchive/data/500k/stats/static_cmds'
filter_cmd_dir='/vault-home/goelayu/webArchive/data/500k/stats/filter_cmds'


fin_tars_dir='/vault-home/goelayu/webArchive/data/500k/fin_tars'

#  change directory to SSD
cd /w/goelayu/webArchive/data/sites/

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
    cat ${filter_cmd_dir}/${site} | parallel --max-proc 5 &> /vault-home/goelayu/webArchive/logs/filter_files/${site}
    end=`date +%s`
    runtime=$((end-start))
    echo 'done generating filter files in time: ', $runtime 
    echo 'Launch static analysis parallel script'
    start=`date +%s`
    # # run inst commands in program_analysis directory
    cd /vault-home/goelayu/webArchive/program_analysis/analyzers/
    cat ${static_cmd_dir}/${site} | parallel --max-proc 5 &> /vault-home/goelayu/webArchive/logs/static_analysis/${site}
    end=`date +%s`
    runtime=$((end-start))
    echo 'done launching static analysis commands from in time: ', $runtime
    
    cd /w/goelayu/webArchive/data/sites/
    # tar -zcf /vault-home/goelayu/webArchive/data/500k/out_tars/${site}.tar.gz ${site} && rm -r ${site} &
    mv $site /y/goelayu/webArchive/data/out_dirs/
    echo 'Site ' $site, ' finished...'
    endM=`date +%s`
    runtime=$((endM-startM))
    echo 'Processing ', $site, ' took ', $runtime ' seconds' 
done<$1