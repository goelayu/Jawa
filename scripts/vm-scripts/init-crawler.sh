

#!/bin/bash

echo 'Running site', $1
# sudo mkdir /data
sudo sysctl -w net.ipv4.ip_forward=1
sudo chown goelayu:goelayu /data
cd /home/goelayu/webArchive/scripts
which node
node crawlWayBack.dedup.js -o /data/performance/ -m record -p /data/record/ &>> /data/logs
