#!/bin/bash
# This script instruments the additional crawls

src_dir='/w/goelayu/webArchive/data'

inst_cmd_dir='/vault-home/goelayu/webArchive/data/storage-mix-large/1m-snapshot/stats/inst_cmds'
replay_cmd_dir='/vault-home/goelayu/webArchive/data/storage-mix-large/1m-snapshot/stats/replay_cmds'

replay_log_dir='/vault-home/goelayu/webArchive/logs/storage-mix-large/1m-snapshot/'

fin_tars_dir='/vault-home/goelayu/webArchive/data/500k/fin_tars'
src_tars_dir='/vault-home/goelayu/webArchive/data/500k/src_tars'
raw_dir='/x/goelayu/webArchive/data/raw_dirs/storage-mix-large/1m-snapshot'
raw_dir_y='/y/goelayu/webArchive/data/raw_dirs/storage-mix-large/1m-snapshot'

log_dir='/vault-home/goelayu/webArchive/logs/NSDI22/add_crawls/inst'

#  change directory to SSD
mkdir -p /w/goelayu/webArchive/data/
cd /w/goelayu/webArchive/data/

while read crawler; do 
    cd /w/goelayu/webArchive/data/
    # mkdir -p $crawler/;
    # mkdir -p ${raw_dir}/$crawler/
    # cd $crawler;
    echo 'Copying tar for site', $crawler
    # #extract the tar
    # cp /vault-home/goelayu/webArchive/data/500k/add_crawls/set1/${site}/${site}.tar.gz .
    start=`date +%s`
    # tar -xzf /vault-home/goelayu/webArchive/data/storage-mix-large/1m-snapshot/$crawler/record.tar.gz
    tar -xf ${raw_dir}/${crawler}/${crawler}.mod.tar
    end=`date +%s`
    runtime=$((end-start))
    echo 'done extracting tar' $runtime
    cd /vault-home/goelayu/webArchive/scripts/
    start=`date +%s`
    cat ${replay_cmd_dir}/${crawler}.nofilter | parallel --max-proc 30 &> ${replay_log_dir}/${crawler}.replay.nofilter
    end=`date +%s`
    runtime=$((end-start))
    echo 'done launching replay commands from', $(pwd) $runtime

    #compute total allFns while and then tar the files
    # cd /w/goelayu/webArchive/data/sites/$site
    # find performance -iname allFns > /vault-home/goelayu/webArchive/data/500k/stats/fns/$site

    # cd ../ && tar zcf $site.tar.gz $site && mv $site.tar.gz $fin_tars_dir && rm -r $site &
    echo Done running all scripts. Creating tars separately - src and out
    cd /w/goelayu/webArchive/data/
    # tar zcf $site.mod.tar.gz $site/mod && mv $site.mod.tar.gz $raw_dir/mods/ && rm -r $site/mod
    # rsync -a $site/instOutput/* $raw_dir/$site/instOutput && rm -r $site/instOutput
    # create tars for both instOutput and performance since they are needed for analysis, delete everything else
    start=`date +%s`
    tar -cf ${raw_dir_y}/$crawler/${crawler}.performance.nofilter.tar $crawler/performance
    # tar -cf ${raw_dir}/$crawler/${crawler}.instOutput.tar $crawler/instOutput &
    # tar -cf ${raw_dir}/$crawler/${crawler}.mod.tar $crawler/mod &
    # wait $(jobs -p)
    echo Done tarring output directories
    rm -r $crawler &
    end=`date +%s`
    runtime=$((end-start))
    # tar --use-compress-program=pigz -cf $site.tar.src.pigz $site/orig $site/mod && mv $site.tar.src.pigz $src_tars_dir
    # tar --use-compress-program=pigz -cf ../out_tars/$site.tar.out.pigz $site/instOutput $site/performance && rm -r $site

    echo 'Site ' $crawler, ' finished...'
done<$1