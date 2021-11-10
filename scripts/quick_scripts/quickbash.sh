#!/bin/bash

# cd /w/goelayu/webArchive/
# mkdir -p storage-mix-corpus/500k-snapshot

# cd /w/goelayu/webArchive/storage-mix-corpus/500k-snapshot

# for i in $(seq 27 38); do mkdir crawler_${i}; done


cd /w/goelayu/webArchive/storage-mix-corpus/500k-snapshot
# cd /vault-home/goelayu/webArchive/data/storage-mix-large/500k-snapshot
# for i in $(seq 27 38); do tar xzf crawler_${i}/performance.tar.gz -C /w/goelayu/webArchive/storage-mix-corpus/500k-snapshot/crawler_${i}/ --wildcards --no-anchored '*network'  &  done
outdir='/vault-home/goelayu/webArchive/results/analysis/500k-snapshot/js-other-dedup'
find . -maxdepth 3 -type d  | awk -F'/' '{if (NF == 4) print $0}' | while read path;  do site=`echo $path | cut -d/ -f4`; echo "r=\`node /vault-home/goelayu/webArchive/scripts/js-formats/file-dedup-network.js -n <(find /w/goelayu/webArchive/storage-mix-corpus/500k-snapshot/$path -iname network )\` ; echo \$r  > $outdir/$site;" ; done | parallel