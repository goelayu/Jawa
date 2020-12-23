

# tmux new-session -d -s crawl 'bash init-crawler.sh <(echo www.nytimes.com)'
FILE=/home/goelayu/research/webArchive/sites/alexa_100_10k
count=1
while read i; do 
    site1=`cat $FILE | head -n $count | tail -n 1`
    count=$(( $count + 1))
    site2=`cat $FILE | head -n $count | tail -n 1`
    count=$(( $count + 1))
    # addr=`echo $i | cut -d' ' -f2`; ssh $addr 'bash init-crawler.sh <(printf "$site1\n$site2\n")' 
    addr=`echo $i | cut -d' ' -f2`;
    echo Launching sites $site1, $site2 at $addr
    ssh -t $addr << HERE
        tmux new-session -d -s crawl
        tmux send-keys "bash init-crawler.sh <(printf '$site1\n$site2\n')" 'C-m'
HERE
done<$1 