# Test the optimization when redirects are rewritten automatically 
# 1) Generate redirect mapping using the mahimahi files
# 2) Generate ttfb for every direct request
# 3) Patch mahimahi files using the redirect maps
# 4) Run mahimahi replay shell with a) patched files and b) ttfb delays

# set -v


RECORDLOGS=/home/goelayu/research/webArchive/data/performance/record/rand200/from2010/0/
REPLAYLOGS=/home/goelayu/research/webArchive/data/performance/replay/rand200/from2010/server_push/1/
ARCHIVEDSITES=/home/goelayu/research/webArchive/sites/archiveUrls_rand200_from2010
RECORDDATA=/home/goelayu/research/webArchive/data/record/rand200/from2010/0/
REDIRECTMAPS=/home/goelayu/research/webArchive/data/processed/redirectMap/from2010/
CMDLOGS=/home/goelayu/research/webArchive/logs
PROCESSEDRECORDDATA=/home/goelayu/research/webArchive/data/processed/record/rand200/from2010/0/
# STMAPPING=/home/goelayu/research/hotOS/Mahimahi/buildDir/bin/server_think_time_map.txt
STMAPPING=/home/goelayu/research/webArchive/data/processed/url-to-time
ALLSITES=/home/goelayu/research/webArchive/sites/rand_200
TMPFILE=/tmp/tmp_replay
PROCESSEDRECORDDATA2=/home/goelayu/research/misc/record/rand200/from2010/patch_toolbar/


# Generate the redirect URLs mapping
# while read i; do
#     echo "Processing ", $i, " for redirect urls"
#     t=`ls -tr $RECORDLOGS/$i | head -n 1`;node generate-server-think-time.js -i $RECORDLOGS/$i/$t/network -d urlMap -o $REDIRECTMAPS/$i ;
# done<$ALLSITES
# echo "Done generating redirect urls map"

# #Patch the mahimahi files
# while read i; do
#     echo "Processing ", $i, " for mahimahi patching"
#     mkdir -p $PROCESSEDRECORDDATA2/$i/
#     python patch-MM-redirect-urls.py $RECORDDATA/$i/ $PROCESSEDRECORDDATA2/$i/ $REDIRECTMAPS/$i --patches "noredirect,toolbar"
# done<$ALLSITES
# echo "Done patching mahimahi files"


#Generate ttfb delays per resource and run mahimahi replay
while read i; do
    echo "Processing ", $i, " for ttfb delays"
    t=`ls -tr $RECORDLOGS/$i | head -n 1`;node generate-server-think-time.js -i $RECORDLOGS/$i/$t/network -d ttfb_sp -u $i | awk '{print $1,$2}' > $STMAPPING/$i
    # t=`ls -tr ../data/performance/rand200_run2/$i | head -n 1`;node generate-server-think-time.js -i $RECORDLOGS/$i/$t/network -d ttfb 2>/dev/null | awk '$3 ~ /20/ {print $1,$2}'  > $TMPFILE
    # sudo cp $TMPFILE $STMAPPING
    echo "Generate ttfb mapping\nRunning replay"
    arcUrl=`cat $ARCHIVEDSITES | grep $i`; node crawlWayBack2.js -s -u $arcUrl -o $REPLAYLOGS -m replay -p $PROCESSEDRECORDDATA2/$i
done<$ALLSITES



