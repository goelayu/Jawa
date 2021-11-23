# This script contains
# a log of bash commands
# for analysing the entire storage corpus
# (similar to the eval scripts)

# extract the network files
~/webArchive/data/storage-mix-large/500k-snapshot$  for i in $(seq 15 26); do tar xzf crawler_${i}/performance.tar.gz -C /w/goelayu/webArchive/storage-mix-corpus/500k-snapshot/crawler_${i}/ \
 --wildcards --no-anchored '*network'  &  done

# process the network files
 goelayu@lions:~/webArchive/scripts$ for i in $(seq 15 26); do echo "r=\`node js-formats/file-dedup-network.js -n <(find /w/goelayu/webArchive/storage-mix-corpus/500k-snapshot/crawler_${i} -iname network )\` ; echo $i \$r" ; done parallel > ../results/analysis/500k-snapshot/js-other-dedup.lions 1&


# create inst and replay cmds 
goelayu@wolverines:~/webArchive/program_analysis$ ls ../data/storage-mix-large/500k-snapshot/ | grep crawler | while read crawler; do less ../data/storage-mix-large/500k-snapshot/$crawler/logs | grep 'making directory' | head -n 5000 | awk '{print $3}' | cut -d/ -f4- | while read i; do echo "mkdir -p '/w/goelayu/webA
rchive/data/$crawler/mod/$i' && mkdir -p '/w/goelayu/webArchive/data/$crawler/instOutput/$i' && python ../pyutils/instrument.py '/w/goelayu/webArchive/data/$crawler/orig/$i' '/w/goelayu/webArchive/data/$crawler/mod/$i' dynamic-cfg '/w/goelayu/webArchive/data/$crawler/instOutput/$i' --filter &> '/w/goelayu/webArchive/
data/$crawler/instOutput/$i/py_out'" ; done > ../data/storage-mix-large/500k-snapshot/stats/inst_cmds/$crawler &   done

goelayu@wolverines:~/webArchive/program_analysis$ ls ../data/storage-mix-large/500k-snapshot/ | grep crawler | while read crawler; do less ../data/storage-mix-large/500k-snapshot/$crawler/logs | grep 'mm-webrecord' | head -n 5000 | while read j; do i=`echo $j | awk '{print $2}' | cut -d/ -f4-`; site=`echo $j | awk '{print $6}'`; echo "DATAFLAGS=\"-n -j --wait --custom CG --timeout 30000 --logs\" ./replay_mahimahi.sh '/w/goelayu/webArchive/data/$crawler/mod/$i' '/w/goelayu/webArchive/data/$crawler/performance/$i/' replay archive $site" ; done > ../data/storage-mix-large/500k-snapshot/stats/replay_cmds/$crawler &  done



for i in $(seq 39 50); do tar xzf crawler_${i}/performance.tar.gz -C /w/goelayu/webArchive/storage-mix-corpus/500k-snapshot/crawler_${i}/ --wildcards --no-anchored logs  &  done