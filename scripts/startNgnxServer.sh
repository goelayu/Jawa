# This script would start the nginx based
# replay server 


SERVERROOTDIR=/home/goelayu/research/blaze/
cur_dir=${PWD}

cleanup(){
    sudo pkill dnsmasq
    sudo pkill nginx
    # kill -9 `cat ${cur_dir}/${SERVERPID}`
}

return_server_status(){
    server_proc_count=`ps aux | grep 'blaze replay' | grep -v 'grep' | wc -l`
    ret=0
    if [[ $server_proc_count  != 1 ]]; then
        echo "Replay server failed to start"
        ret=1;
    fi
}

# cleanup
cd $SERVERROOTDIR;
# run cmds as root
# sudo -s <<EOF
source .blaze_env/bin/activate
cmd="blaze replay --key_path $SERVERROOTDIR/certs/server.key --cert_path $SERVERROOTDIR/certs/server.cert $1 ${@:2}"
echo $cmd;
$cmd
# EOF

# _pid=$!
# echo 'pid of process' $_pid and serverpid is $SERVERPID
# echo $_pid > ${cur_dir}/${SERVERPID} 
# echo "Started replay server.."
# # disown -a

# # wait 5s for the server to start
# # sleep 5
# return_server_status
# exit $ret




