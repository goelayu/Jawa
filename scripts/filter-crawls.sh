# Process crawling data to detect invalid crawls
# Inspects the DOM information fetched during the crawl
# and looks for certain keywords to identify if the crawl
# was invalid

# Arguments:
# $1 -> list of sites crawled
# $2 -> path to the directory contained crawled data
# $3 -> tag for the outputfile
# set -e

# ERROR MESSAGES
#1 We are limiting the number of URLs you can submit to be Archived to the Wayback Machine, using the Save Page Now features, to no more than 15 per minute.
#2 404 - Not Found
#3 No web site is configured at this address.
#4 403 Forbidden
#5 Got an HTTP 302 response at crawl time
#6 Undefined -- page not found

TMPFILE1=/tmp/_filter
TMPFILE2=/tmp/_filter2
TMPFILE3=/tmp/_filter3

usage(){
    echo "Remember to update the site name extraction logic"
    echo "as it dependent on the path of the file"
}
#Arguments
#$1 -> error token to be grepped
#$2 -> destination director to be grepped
#$3 -> Initial list of urls
GrepErrorToken(){
    # echo Checking for token "$1"
    for i in `find $2 -iname DOM`; do 
        # echo "Finding token ", $1," in $i"
        if [[ "$1" == "undefined" ]]; then
            dom=`cat $i`
            if [[ ${dom} == "undefined" ]];then
                echo $i | cut -d/ -f8
            fi
        elif grep -iq "$1" $i; then
            # echo Found match in $i
            echo $i | cut -d/ -f8
        fi
    done 1>$TMPFILE2
    diff --old-line-format="%L" --new-line-format="" --unchanged-line-format="" \
        <(cat $3 | sort) <(cat $TMPFILE2 | sort) > $TMPFILE1

    echo `cat $3 | wc -l ` to `cat $TMPFILE1 | wc -l` urls
    cat $TMPFILE2
    cp $TMPFILE1 $TMPFILE3
}

errTokens=("We are limiting the number of URLs you can submit to be Archived to the Wayback Machine"
# "Not found"  -- not detailed enough
"No web site is configured"
# "Forbidden" -- not detailed enough
"302 response at crawl time"
"undefined"
"replayserver")

cp $1 $TMPFILE3

usage 

for ((ind = 0; ind < ${#errTokens[@]}; ind++)); do
    token="${errTokens[$ind]}"
    echo Current token --  ${token}
    GrepErrorToken "${token}" $2 $TMPFILE3
done


cp $TMPFILE3 ${3}

# GrepErrorToken "too many requests" $2 $1
# GrepErrorToken "crawl error" $2 $TMPFILE3
# GrepErrorToken "no site found" $2 $TMPFILE3


