#!/bin/bash
# run command on each virtual machine
# $1 -> list of addrs
# $2 -> string command 

FILE='/vault-home/goelayu/webArchive/sites/alexa/alexa-300-rand'
count=1
while read i; do 
    addr=`echo $i | cut -d' ' -f2`;
    crawler=`echo $i | cut -d' ' -f1`;
#     ssh -o StrictHostKeyChecking=no  $addr << HERE
#         tmux new-session -d -s crawl
#         tmux send-keys "bash init-crawler.sh <(printf '$site1\n')" 'C-m'
# HERE
    echo $i" "
    top=$((count*7))
    sites=`cat $FILE | head -n $top | tail -n 7`;
    # ssh -n -o StrictHostKeyChecking=no $addr "bash /home/goelayu/webArchive/scripts/mount-disk.sh"
    # echo $sites
    # scp crawlWayBack-timestamps.js $addr:/home/goelayu/webArchive/scripts/ &
    # ssh -o StrictHostKeyChecking=no $addr "cd /data; tar zcf - performance" > /vault-home/goelayu/webArchive/data/storage-mix-large/1m-snapshot/$crawler/performance.tar.gz &
    # scp crawlWayBack-timestamps.js $addr:/data/logs /vault-home/goelayu/webArchive/data/storage-mix-large/1m-snapshot/$crawler/ &
    ssh -o StrictHostKeyChecking=no $addr /bin/bash << HERE
    find /data/performance -iname plt | wc -l
HERE
    count=$((count+1))
done<"$1"

wait $(jobs -p)

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