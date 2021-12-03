#!/bin/bash
# run command on each virtual machine
# $1 -> list of addrs
# $2 -> string command 

# FILE='/vault-home/goelayu/webArchive/sites/alexa/alexa-300-rand'
FILE='/vault-home/goelayu/webArchive/scripts/vm-scripts/runtime-persistence/gt100pages'
count=1
while read i; do 
    addr=`echo $i | cut -d' ' -f2`;
    crawler=`echo $i | cut -d' ' -f1`;
#     ssh -o StrictHostKeyChecking=no  $addr << HERE
#         tmux new-session -d -s crawl
#         tmux send-keys "bash init-crawler.sh <(printf '$site1\n')" 'C-m'
# HERE
    # echo $i" "
    top=$((count*3))
    sites=`cat $FILE | head -n $top | tail -n 3`;
    # ssh -n -o StrictHostKeyChecking=no $addr "find /home/goelayu/webArchive/logs/ -iname logs | wc -l"
    # echo $sites
    scp -r $addr:/home/goelayu/webArchive/logs ../../data/storage-mix-large/100k-logs/${crawler} &
    # ssh -o StrictHostKeyChecking=no $addr "cd /data; tar zcf - record" > /vault-home/goelayu/webArchive/data/storage-mix-large/2m-snapshot/$crawler/record.tar.gz &
    # scp -o StrictHostKeyChecking=no chrome-launcher.js $addr:/home/goelayu/webArchive/scripts/ &
#     ssh -o StrictHostKeyChecking=no $addr /bin/bash << HERE
#     cd /home/goelayu/webArchive/scripts;
#     tmux send-keys "ls | grep snaps | while read i; do cat \\\$i | jq -r '.[] | \"\(.[0]) \(.[1])\"' ; done | grep -v timestamp | while read i; do t=\\\`echo \\\$i | cut -d' ' -f1\\\`; s=\\\`echo \\\$i | cut -d' ' -f2\\\`; mkdir ../logs/\\\$t; node chrome-launcher.js -u https://web.archive.org/web/\\\$t/\\\$s -l -o ../logs/\\\$t --timeout 200000 ; done > logs" 'C-m'
# HERE
#     count=$((count+1))
done<"$1"

wait $(jobs -p)
# tmux send-keys 'cat sites | while read i; do /home/goelayu/.nvm/versions/node/v16.11.0/bin/node get-frequent-wb-pages.js -t uniq -u \$i ; done' 'C-m'

# cd /home/goelayu/webArchive/scripts
# sudo chown goelayu:goelayu /data/md
# sudo chown goelayu:goelayu /data/md
# echo "$sites" > sites
# cat sites | while read i; do /home/goelayu/.nvm/versions/node/v16.11.0/bin/node crawlWayBack-timestamps.js -u \$i -o /data/md/ &> /data/log ; done

#scp crawlWayBack.dedup.js $addr:/home/goelayu/webArchive/scripts/

# sudo sysctl -w net.ipv4.ip_forward=1
# sudo chown goelayu:goelayu /data
# cd /home/goelayu/webArchive/scripts
# /home/goelayu/.nvm/versions/node/v16.11.0/bin/node crawlWayBack.dedup.js -o /data/performance/ -m record -p /data/record/ &>> /data/logs

# cd /home/goelayu/webArchive/scripts;
# tmux send-keys "ls | grep uniq | while read i; do cat \\\$i | jq -r '.[]' | while read j; do echo \"r=\\\`/home/goelayu/.nvm/versions/node/v16.11.0/bin/node get-frequent-wb-pages.js -t count -u \\\$j\\\`; echo '\\\$j' \\\\\\\$r\"; done; done | parallel > fin-out" 'C-m'