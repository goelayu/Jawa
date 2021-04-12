

#!/bin/bash

sudo sysctl -w net.ipv4.ip_forward=1

cd /home/goelayu/webArchive/scripts
which node
node crawlWayBack.dedup.js -u $1 -o ../data/performancem/ -m replay -p ../data/record/ &>> ../logs