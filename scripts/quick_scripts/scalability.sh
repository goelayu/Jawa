#!/bin/bash

# THis bash script iterates over all the 50 sites
# and for each site dumps the first n pages and then does a round robin
# until all pages from each site are dumped. 
# Prints the js to all bytes ratio for the entire corpus
# Excludes certain sites which didn't have the js byte distribution

for c in $(seq 1 10); do 
    ls /vault-home/goelayu/webArchive/results/NSDI22/motivation/scale | grep -v thetimes.co | \
        grep -v economictimes.indiatimes | grep -v money.cnn | grep -v smh.com | \
    while read i; do
        len=`cat /vault-home/goelayu/webArchive/results/NSDI22/motivation/scale/$i | wc -l`;
        setsize=$((len/10));
        curhead=$((setsize*c));
        cat /vault-home/goelayu/webArchive/results/NSDI22/motivation/scale/$i | awk '{print $2-prevj, ($2+$4+$6+$8 - prevt); prevj=$2; prevt=$2+$4+$6+$8}' \
            | head -n $curhead | tail -n $setsize;
    done
done |  awk '{js+=$1; other+=($2);print NR*10, js/other}'