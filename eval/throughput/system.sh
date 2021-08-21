#!/bin/bash
machine=$(uname -n)

sites=/home/goelayu/research/webArchive/sites/alexa_100_news.txt

if [[ $machine == 'wolverines' || $machine == 'lions' || $machine == 'redwings' || $machine == 'pistons' ]]; then
	echo 'Running on wolverines'
	sites=/vault-home/goelayu//webArchive/sites/alexa_100_news.txt
fi

echo Starting mitm proxy
node mitm-proxy.js & 
sleep 1
cat $sites | while read i; do
    rm /tmp/webarchive/*
    if ! ps aux | grep "mitm-proxy" | grep -v grep ; then 
        echo Restarting proxy
        node mitm-proxy.js &
    fi
    echo Launching site $i
    node chrome-launcher-system.js -u $i --timeout 100000 --completeG --filter
done

echo Killing proxy
ps aux | grep mitm-proxy | awk '{print $2}' | xargs kill -9