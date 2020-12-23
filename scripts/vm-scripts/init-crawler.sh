

#!/bin/bash

sudo sysctl -w net.ipv4.ip_forward=1
sudo chown goelayu:goelayu /data
cd /home/goelayu/webArchive/scripts
which node
while read i; do node crawlWayBack.dedup.js -u $i -o /data/performance/ -m record -p /data/record/ &>> /data/logs ; done<$1
