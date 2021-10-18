# This script contains
# a log of bash commands
# for analysing the entire storage corpus
# (similar to the eval scripts)

# extract the network files
~/webArchive/data/storage-mix-large/500k-snapshot$  for i in $(seq 15 26); do tar xzf crawler_${i}/performance.tar.gz -C /w/goelayu/webArchive/storage-mix-corpus/500k-snapshot/crawler_${i}/ \
 --wildcards --no-anchored '*network'  &  done

# process the network files
 goelayu@lions:~/webArchive/scripts$ for i in $(seq 15 26); do echo "r=\`node js-formats/file-dedup-network.js -n <(find /w/goelayu/webArchive/storage-mix-corpus/500k-snapshot/crawler_${i} -iname network )\` ; echo $i \$r" ; done \
  | parallel > ../results/analysis/500k-snapshot/js-other-dedup.lions 1&