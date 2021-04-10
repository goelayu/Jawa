#!/bin/bash
# This script instruments and then runs pages 
# for the given sites

src_dir='/w/goelayu/webArchive/data'

inst_cmd_dir='/vault-home/goelayu/webArchive/data/500k/stats/inst_cmds'
replay_cmd_dir='/vault-home/goelayu/webArchive/data/500k/stats/replay_cmds'

replay_log_dir='/vault-home/goelayu/webArchive/logs/500k/'

#  change directory to SSD
mkdir -p /w/goelayu/webArchive/data/sites/
cd /w/goelayu/webArchive/data/sites/

while read site; do 
    cd /w/goelayu/webArchive/data/sites/
    mkdir -p $site/orig/;
    cd $site;
    echo 'Copying tar for site', $site
    #extract the tar
    cp /vault-home/goelayu/webArchive/data/500k/tars/${site}.tar .
    echo 'done copying tar'
    echo 'extracting tar from', $pwd
    #extract the tar
    tar xf ${site}.tar
    echo 'done extracting tar'
    # mv data to correct directory
    mv data/*/*/record/$site/* orig/ 
    rm -r data
    rm -r ${site}.tar
    echo 'done moving data'
    # # run inst commands in program_analysis directory
    cd /vault-home/goelayu/webArchive/program_analysis
    cat ${inst_cmd_dir}/${site} | parallel --max-proc 5
    echo 'done launching inst commands from', pwd
    # # load pages in chrome
    cd /vault-home/goelayu/webArchive/scripts/
    cat ${replay_cmd_dir}/${site} | parallel --max-proc 10 &> ${replay_log_dir}/${site}
    echo 'done launching replay commands from', pwd
done<$1