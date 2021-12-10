#!/bin/bash

# THis bash script iterates over all the 50 sites
# and for each site dumps the first n pages and then does a round robin
# until all pages from each site are dumped. 
# Prints the js to all bytes ratio for the entire corpus
# Excludes certain sites which didn't have the js byte distribution
src="/vault-home/goelayu/webArchive/results/OSDI22/eval/storage/mix/storage/all_resources/"
# for c in $(seq 1 10); do 
ls $src | grep -v network | while read i; do
        # len=`cat /vault-home/goelayu/webArchive/results/NSDI22/motivation/scale/$i | wc -l`;
        # setsize=$((len/10));
        # curhead=$((setsize*c));
        cat $src/$i |  awk '{if (NF == 8 && $1 == "js") print $0}' | awk '{print $2-prevj, ($2+$4+$6+$8 - prevt); prevj=$2; prevt=$2+$4+$6+$8}' 
            # | head -n $curhead | tail -n $setsize;
    # done
done  |  awk '{js+=$1; other+=($2);print NR*1, js, other, js/other}'