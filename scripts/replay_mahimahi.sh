#!/bin/bash
# $1 -> path to the recorded pages
# $2 -> path to the output directory
# $3 -> Mode ( record or replay)
# $4 -> path to the list of pages
#$5 -> chrome config mode

# set -v

mmwebreplay=/home/goelayu/research/mahimahi/build/bin/mm-webreplay
mmnoop=/home/goelayu/research/mahimahi/build/bin/mm-noop
mmwebrecord=/home/goelayu/research/mahimahi/build/bin/mm-webrecord

# ipfilePrefix=/home/goelayu/research/WebPeformance/output/unmodified/trace_5_15_record_v76_ssl1.0_c69/
ipfilePrefix=/home/goelayu/research/WebPeformance/traces/vaspol/record/devtools_logs/0/
ipfileDst=/home/goelayu/research/hotOS/Mahimahi/buildDir/bin/delay_ip_mapping.txt

echo "DATA FLAGS: " $DATAFLAGS
nodeTIMEOUT=0

if [[ $DATAFLAGS == *"testing"* ]]; then
    echo "Running in testing mode..."
    nodeTIMEOUT=1100000
fi

help(){
	echo "Note: The 3rd argument (path to the output directory) shouldn't contain a backslash at the end"
}

clean(){
	rm fetchErrors
	rm loadErrors
}

# @params: <path to mm dir> <url> <output directory> <url> <conf file>
replay(){
	echo "$@"
	echo "url is",$url
	mkdir -p $3
	echo "Launching chrome"
	cmd=""
	if [[ $5 == "mmreplay" ]]; then
		cmd="mm-webreplay $1"
		echo "REPLAY MODE"
	elif [[ $5 == "nginx" ]]; then
		echo "NGINX replay mode"
		export DATAFLAGS=$DATAFLAGS
		fullpath=$(realpath $1)
		$mmnoop bash startChrome.sh $2 $3 $fullpath --enable_http2
		echo "done waiting"
		return
	elif [[ $5 == *"record"* ]]; then
		cmd="$mmwebrecord $1"
		echo "RECORD MODE";
	fi;
	#avoid 9600 range because a certain kworker runs on port 9645
	port=`shuf -i 9600-9900 -n 1`
	echo "Running on port" $port
    $cmd node inspectChrome.js -u $2 -o $3 -p $port --mode $mode --chrome-conf $6 $DATAFLAGS
    # sleep 4
	replay_pid=$!
	#waitForNode
	# waitForNode $port
	echo "Done waiting"
}


# The comparison of count variable is with 2, because for some reason there is an additional 
# process started by root on the same node port
waitForNode(){
	count=0
	start_time=`date +'%s'`
	while [[ $count != 1 ]]; do
		count=`ps aux | grep -w $1 | grep -v "mm-" | awk '{print $2}' | wc -l` 
		echo "Current count is", $count
		curr_time=`date +'%s'`
		elapsed=`expr $curr_time - $start_time`
		echo $elapsed
		if [ $elapsed -gt $nodeTIMEOUT ]; then
			echo "TIMED OUT..."
			ps aux | grep -w $1 | grep -v "mm-" | awk '{print $2}' | xargs kill -9
		fi
		sleep 2
	done
}


waitForChrome(){
	count=0
	echo "waiting["
	curr_time=`date +'%s'`
	while [[  $count != 3 ]]; do
		count=`ps aux | grep chromium-browser | wc | awk '{print $1}'`
		echo "current count is" $count
		n_time=`date +'%s'`
		elapsed=`expr $n_time - $curr_time`
		echo "Elapsed time since: ", $elapsed
		if [ $elapsed -gt 30 ]; then
			echo "TIMED OUT..."
			ps aux | grep 9222 | awk '{print $2}' | xargs kill -9
		fi
		sleep 1;
	done
}

# help
# clean

while read url; do
	echo "replaying url: " $url
	clean_url=`echo $url | cut -d'/' -f3-`
	clean_url=`echo ${clean_url} | sed 's/\//_/g' | sed 's/\&/-/g'`
	mmpath=$1
	out=$2
	echo "clean url is " ${clean_url}
	toolmode=$3
	conf=./chromeConfigs/$4
	replay $mmpath//${clean_url} $url $out//${clean_url} $clean_url $toolmode $conf
	# replay $mmpath/1/${clean_url} $url $out/1/${clean_url} $clean_url $4
	sleep 2
done<"$5"