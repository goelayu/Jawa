#!/bin/bash

while read i; do
    node crawlWayBack.js -u $i -o ../data/performance/
done<$1