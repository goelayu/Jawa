#! /bin/bash

#######################
# Usage:
#  ./fidelity.sh <corpus_size> <num of parallel processes>
#######################

cd ../scripts;

# Load web pages as a part of the original run

echo "Loading web pages as Internet Archive..."
echo "Original run.. (Internet Archive)"
mkdir -p ../data/performance/fidelity/original
cat ../sites/alexa/alexa-3k-orig | shuf -n $1 | while read site ; do
    echo DATAFLAGS=" -j --timeout 15000 -n" ./replay_mahimahi.sh ../record ../data/performance/fidelity/original replay live $site ;
done | parallel -j $2

echo "Replay run.. (Internet Archive)"
mkdir -p ../data/performance/fidelity/iphone
cat ../sites/alexa/alexa-3k-orig | shuf -n $1 | while read site ; do
    echo DATAFLAGS=" -j --timeout --deterministic 15000 -n" ./replay_mahimahi.sh ../record ../data/performance/fidelity/iphone/ replay live $site ;
done | parallel -j $2

echo "Done loading pages for the Internet Archive.."
echo "Simulating a Jawa run.."

echo "Original run.. (Jawa)"
mkdir -p ../data/performance/fidelity/jawa/0
cat ../sites/alexa/alexa-3k-orig | shuf -n $1 | while read site ; do
    echo DATAFLAGS=" -j --timeout 15000 -n --filter" ./replay_mahimahi.sh ../record ../data/performance/fidelity/jawa/0 replay live $site ;
done | parallel -j $2

echo "Replay run.. (Jawa)"
mkdir -p ../data/performance/fidelity/jawa/0
cat ../sites/alexa/alexa-3k-orig | shuf -n $1 | while read site ; do
    echo DATAFLAGS=" -j --timeout 15000 -n --filter" ./replay_mahimahi.sh ../record ../data/performance/fidelity/jawa/1 replay live $site ;
done | parallel -j $2

echo "Done generating network logs.."

echo "Processing output.."

mkdir -p  ../data/results/fidelity;
ls ../data/performance/fidelity/original/ | while read site; do
    node utils/util.js -t matchNetCount -i ../data/performance/iphone//$site/network  -a ../data/performance/orig//$site/network --site-type original
done > ../data/results/fidelity/ia.count

ls ../data/performance/fidelity/jawa/0 | while read site; do
    node utils/util.js -t matchNetCount -i ../data/performance/jawa/0/$site/network  -a ../data/performance/jawa/1//$site/network --site-type jawa
done > ../data/results/fidelity/jawa.count

ls ../data/performance/fidelity/original/ | while read site; do
    node utils/util.js -t matchNetSize -i ../data/performance/iphone//$site/network  -a ../data/performance/orig//$site/network --site-type original
done > ../data/results/fidelity/ia.size

ls ../data/performance/fidelity/jawa/0 | while read site; do
    node utils/util.js -t matchNetSize -i ../data/performance/jawa/0/$site/network  -a ../data/performance/jawa/1//$site/network --site-type jawa
done > ../data/results/fidelity/jawa.size

echo "n,network" > ../data/results/fidelity/size.p
cat ../data/results/fidelity/jawa.size | awk '{if (NF ==2 && $1 > 0) print $2/$1, ",Jawa"}' >> ../data/results/fidelity/size.p
cat ../data/results/fidelity/ia.size | awk '{if (NF ==2 && $1 > 0) print $2/$1, ",IA"}' >> ../data/results/fidelity/size.p

echo "n,network" > ../data/results/fidelity/count.p
cat ../data/results/fidelity/jawa.count | awk '{if (NF ==2 && $1 > 0) print $2/$1, ",Jawa"}' >> ../data/results/fidelity/count.p
cat ../data/results/fidelity/ia.count | awk '{if (NF ==2 && $1 > 0) print $2/$1, ",IA"}' >> ../data/results/fidelity/count.p

echo "Plotting data.."
./fidelity.r ../data/results/fidelity/size.p ../data/results/fidelity/count.p