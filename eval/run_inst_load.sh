#!/bin/bash
# This script instruments and then runs pages 
# for the given sites

src_dir='/w/goelayu/webArchive/data'

inst_cmd_dir='/vault-home/goelayu/webArchive/data/500k/stats/inst_cmds'
replay_cmd_dir='/vault-home/goelayu/webArchive/data/500k/stats/replay_cmds'

replay_log_dir='/vault-home/goelayu/webArchive/logs/500k/'

fin_tars_dir='/vault-home/goelayu/webArchive/data/500k/fin_tars'
src_tars_dir='/vault-home/goelayu/webArchive/data/500k/src_tars'

#  change directory to SSD
mkdir -p /w/goelayu/webArchive/data/sites/
cd /w/goelayu/webArchive/data/sites/

while read site; do 
    cd /w/goelayu/webArchive/data/sites/
    mkdir -p $site/orig/;
    cd $site;
    echo 'Copying tar for site', $site
    # #extract the tar
    cp /vault-home/goelayu/webArchive/data/500k/tars/${site}.tar .
    echo 'done copying tar'
    # #extract the tar
    tar xf ${site}.tar
    # echo 'done extracting tar'
    # # mv data to correct directory
    [ -d data ] && mv data/*/*/record/$site/* orig/  && rm -r data
    [ -d $site ] && mv $site/* orig/ && rm -r $site
    rm -r ${site}.tar
    # echo 'done moving data'
    # # run inst commands in program_analysis directory
    cd /vault-home/goelayu/webArchive/program_analysis
    cat ${inst_cmd_dir}/${site} | parallel --max-proc 3
    echo 'done launching inst commands from', $(pwd)
    # # load pages in chrome
    cd /vault-home/goelayu/webArchive/scripts/
    cat ${replay_cmd_dir}/${site} | parallel --max-proc 10 &> ${replay_log_dir}/${site}
    echo 'done launching replay commands from', $(pwd)

    #compute total allFns while and then tar the files
    cd /w/goelayu/webArchive/data/sites/$site
    find performance -iname allFns > /vault-home/goelayu/webArchive/data/500k/stats/fns/$site

    # cd ../ && tar zcf $site.tar.gz $site && mv $site.tar.gz $fin_tars_dir && rm -r $site &
    echo Done running all scripts. Creating tars separately - src and out
    cd ../
    tar --use-compress-program=pigz -cf $site.tar.src.pigz $site/orig $site/mod && mv $site.tar.src.pigz $src_tars_dir
    tar --use-compress-program=pigz -cf ../out_tars/$site.tar.out.pigz $site/instOutput $site/performance && rm -r $site

    echo 'Site ' $site, ' finished...'
done<$1