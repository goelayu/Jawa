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

cat ../sites/alexa/alexa-ae | head -n $1 | while read site ; do
    echo DATAFLAGS=\" -j --timeout 15000 -n\" ./replay_mahimahi.sh ../data/record ../data/performance/fidelity/original replay live "'$site'" ;
done | parallel -j $2

echo "Replay run.. (Internet Archive)"
mkdir -p ../data/performance/fidelity/iphone
cat ../sites/alexa/alexa-ae | head -n $1 | while read site ; do
    echo DATAFLAGS=\" -j --deterministic --timeout 15000 -n\" ./replay_mahimahi.sh ../data/record ../data/performance/fidelity/iphone/ replay live "'$site'" ;
done | parallel -j $2

echo "Done loading pages for the Internet Archive.."
echo "Simulating a Jawa run.."

echo "Original run.. (Jawa)"
mkdir -p ../data/performance/fidelity/jawa/0
cat ../sites/alexa/alexa-ae | head -n $1 | while read site ; do
    echo DATAFLAGS=\" -j --timeout 15000 -n --filter\" ./replay_mahimahi.sh ../data/record ../data/performance/fidelity/jawa/0 replay live "'$site'" ;
done | parallel -j $2

echo "Replay run.. (Jawa)"
mkdir -p ../data/performance/fidelity/jawa/0
cat ../sites/alexa/alexa-ae | head -n $1  | while read site ; do
    echo DATAFLAGS=\" -j --timeout 15000 -n --filter\" ./replay_mahimahi.sh ../data/record ../data/performance/fidelity/jawa/1 replay live "'$site'" ;
done | parallel -j $2

echo "Done generating network logs.."

echo "Processing output.."

mkdir -p  ../data/results/fidelity;
ls ../data/performance/fidelity/original/ | while read site; do
    node utils/util.js -t matchNetCount -i ../data/performance/fidelity/iphone//$site/network  -a ../data/performance/fidelity/original//$site/network --site-type original
done > ../data/results/fidelity/ia.count 2>/dev/null

ls ../data/performance/fidelity/jawa/0 | while read site; do
    node utils/util.js -t matchNetCount -i ../data/performance/fidelity/jawa/0/$site/network  -a ../data/performance/fidelity/jawa/1//$site/network --site-type jawa
done > ../data/results/fidelity/jawa.count 2>/dev/null

ls ../data/performance/fidelity/original/ | while read site; do
    node utils/util.js -t matchNetSize -i ../data/performance/fidelity/iphone//$site/network  -a ../data/performance/fidelity/original//$site/network --site-type original
done > ../data/results/fidelity/ia.size 2>/dev/null

ls ../data/performance/fidelity/jawa/0 | while read site; do
    node utils/util.js -t matchNetSize -i ../data/performance/fidelity/jawa/0/$site/network  -a ../data/performance/fidelity/jawa/1//$site/network --site-type jawa
done > ../data/results/fidelity/jawa.size 2>/dev/null

echo "n,network" > ../data/results/fidelity/size.p
cat ../data/results/fidelity/jawa.size | awk '{if (NF ==2 && $1 > 0) print $2/$1, ",Jawa"}' >> ../data/results/fidelity/size.p
cat ../data/results/fidelity/ia.size | awk '{if (NF ==2 && $1 > 0) print $2/$1, ",IA"}' >> ../data/results/fidelity/size.p

echo "n,network" > ../data/results/fidelity/count.p
cat ../data/results/fidelity/jawa.count | awk '{if (NF ==2 && $1 > 0) print ($1 - $2)/$1, ",Jawa"}' >> ../data/results/fidelity/count.p
cat ../data/results/fidelity/ia.count | awk '{if (NF ==2 && $1 > 0) print ($1 - $2)/$1, ",IA"}' >> ../data/results/fidelity/count.p

echo "Plotting data.."
cd ../ae
./fidelity.r ../data/results/fidelity/size.p ../data/results/fidelity/count.p