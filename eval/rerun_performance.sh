#!/bin/bash
# This script only runs the chrome part 
# and then creates separate tars, one
# including all source files (orig + mod)
# and one including output files, instOutput + performance

src_dir='/w/goelayu/webArchive/data'

inst_cmd_dir='/vault-home/goelayu/webArchive/data/500k/stats/inst_cmds'
replay_cmd_dir='/vault-home/goelayu/webArchive/data/500k/stats/replay_cmds'

replay_log_dir='/vault-home/goelayu/webArchive/logs/500k/'

fin_tars_dir='/vault-home/goelayu/webArchive/data/500k/fin_tars'
src_tars_dir='/vault-home/goelayu/webArchive/data/500k/src_tars'
out_tars_dir='/vault-home/goelayu/webArchive/data/500k/out_tars'

#  change directory to SSD
cd /w/goelayu/webArchive/data/sites/

while read site; do 
    cd /w/goelayu/webArchive/data/sites/

    echo 'Copying tar for site', $site
    # #extract the tar
    cp /vault-home/goelayu/webArchive/data/500k/fin_tars/${site}.tar.gz .
    echo 'done copying tar'
    # #extract the tar
    tar zxf ${site}.tar.gz
    echo 'done extracting tar'
    ls $site
    # # mv data to correct directory
    rm -r ${site}.tar.gz &
    # echo 'done moving data'
    cd /vault-home/goelayu/webArchive/scripts/
    cat ${replay_cmd_dir}/${site} | parallel --max-proc 15 &> ${replay_log_dir}/${site}
    echo 'done launching replay commands from', $(pwd)

    #compute total allFns while and then tar the files
    cd /w/goelayu/webArchive/data/sites/$site
    find performance -iname allFns > /vault-home/goelayu/webArchive/data/500k/stats/fns/$site

    cd ../
    tar --use-compress-program=pigz -cf $site.tar.src.pigz $site/orig $site/mod && mv $site.tar.src.pigz $src_tars_dir
    tar --use-compress-program=pigz -cf ../out_tars/$site.tar.out.pigz $site/instOutput $site/performance

    rm -r $site &

    echo 'Site ' $site, ' finished...'
done<$1