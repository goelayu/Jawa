#!/bin/bash
machine=$(uname -n)

out_dir=/home/goelayu/research/webArchive/eval/throughput/baseline/orig/
log_dir=/home/goelayu/research/webArchive/logs/SOSP21/eval/thoughput
sites=/home/goelayu/research/webArchive/sites/alexa_50news_pages/__all
sites=/home/goelayu/research/webArchive/sites/alexa_100_news.txt

if [[ $machine == 'wolverines' || $machine == 'lions' || $machine == 'redwings' || $machine == 'pistons' ]]; then
	echo 'Running on wolverines'
	out_dir=/w/goelayu/webArchive/eval/throughput/baseline/filter/
    log_dir=/vault-home/goelayu/webArchive/logs/SOSP21/eval/thoughput
    sites=/vault-home/goelayu/webArchive/sites/alexa_50news_pages/__all
    # sites=/vault-home/goelayu/webArchive/sites/alexa_100_news.txt
fi


cat ${sites} | while read i; do 
    # echo Launching $i;
    clean_url=`echo $i | cut -d'/' -f3-`
    dir=`echo ${clean_url} | sed 's/\//_/g' | sed 's/\&/-/g'`
    mkdir -p ${out_dir}/$dir; echo "node chrome-launcher-baseline.js -u $i --timeout 60000 -o $out_dir/$dir --filter --screenshot;"
done