#! /bin/bash

#######################
# Usage:
#  ./fidelity.sh <corpus_size> <num of parallel processes>
#######################

cd ../scripts;

mkdir -p ../logs
mkdir -p ../data/performance/storage/nofilter
mkdir -p ../data/performance/storage/filter
# Run without the filter
echo "Loading pages without the filter"
cat ../sites/alexa/alexa-3k-orig | shuf -n $1 > tempfile
cat tempfile | while read i; do echo "DATAFLAGS=\"-n -j --custom CG,Handlers --timeout 30000 --logs\" ./replay_mahimahi.sh ../data/processed/recorded/ ../data/performance/storage/nofilter replay live $i"; done | parallel -j $2
&> ../logs/storage-nofilter.log

#Run with the filter
echo "Loading pages with the filter"
cat tempfile | while read i; do echo "DATAFLAGS=\"-n -j --filter --custom CG,Handlers --timeout 30000 --logs\" ./replay_mahimahi.sh ../data/processed/recorded/ ../data/performance/storage/filter replay live $i"; done | parallel -j $2
&> ../logs/storage-filter.log

#process the output
echo "Processing output log.."
mkdir -p ../data/results/storage;
node js-formats/fn-cmp.js -v -d ../data/processed/instOutput/ -u <(find ../data/performance/storage/nofilter -iname allFns | cut -d/ -f6) -p ../data/performance/storage/nofilter/ -e ../data/performance/storage/nofilter > ../data/results/storage/nofilter
node js-formats/fn-cmp.js -v -d ../data/processed/instOutput/ -u <(find ../data/performance/storage/filter -iname allFns | cut -d/ -f6) -p ../data/performance/storage/filter/ -e ../data/performance/storage/filter > ../data/results/storage/filter

#Print final output
echo "Storage savings..."
echo "Total JS size (bytes):" $(tail -n1 ../data/results/storage/nofilter | cut -d' ' -f5)
echo "Total JS size after filtering (bytes):" $(tail -n1 ../data/results/storage/filter | cut -d' ' -f5)
echo "Total JS size after filtering + fn pruning (bytes):" $(tail -n1 ../data/results/storage/filter | cut -d' ' -f11)
