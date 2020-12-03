
#generate a 10 character random string
#to uniquely identify the current process
token=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
# trap cleanup INT 

cleanup(){
    echo "cleaning up"
    ps aux | grep 'blaze replay' | awk '{print $2}' | xargs sudo kill -9
    sudo pkill dnsmasq
    sudo pkill nginx
}

echo $@
echo starting nginx
#Pass the token as env var and use -E to preserve env vars
fullpath=$(realpath $3)
sudo bash startNgnxServer.sh $fullpath ${@:4} &
echo "back"
childPid=$!
#wait a second for the blaze pid to be updated
sleep 1
blazePid=$(ps aux | grep 'blaze replay' | grep -v grep | awk '{print $2}')
#wait a few seconds for the blaze server to be started
sleep 4
# echo blaze server pid is $blazePid

echo "checking for blaze pid", $blazePid
if ! ps -p $blazePid >/dev/null
then 
    echo "blaze server didn't start, exiting"
    exit
fi

port=`shuf -i 9400-9800 -n 1`
echo "Running on port" $port
# node inspectChrome.js -u https://web.archive.org/web/20170101011458/http://www.cnn.com/ -o /tmp -p $port --mode std -l   --testing $DATAFLAGS
# node inspectChrome.js -u $1 -l -o ${2} -c -n --log --mode std -p ${port} --testing
node chrome-launcher.js -u $1 -j -l -o $2 -n --timeout 60000 --screenshot $DATAFLAGS
# echo "Need to interrupt the child pid", $childPid
cleanup