
# sudo parted /dev/sdc --script mklabel gpt mkpart xfspart xfs 0% 100% ; sleep 1
# sudo mkfs.xfs /dev/sdc1
# sudo partprobe /dev/sdc1

# sudo mkdir /data

# sudo mount /dev/sdc1 /data

sudo chown goelayu:goelayu /data
mkdir /data/md/