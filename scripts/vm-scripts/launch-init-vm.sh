# this scriopt launches and initializes azure crawl vms

# $1 -> Number of VMs

for i in $(seq 1 $1); do
    az vm create --resource-group webarchive_crawler --name crawler_${i} --image crawl_image --size STANDARD_B1MS --generate-ssh-keys &
done

echo 'Done creating vms '
# for i in $(seq 1 $1); do
#     az disk create -g webarchive_crawler -n crawl_disk_${i} --size-gb 512 --sku Standard_LRS & 
# done

# echo 'Done creating disks'

#wait a minute for all the vms and disk to be initialized before attaching them together
# sleep 90

# for i in $(seq 1 $1); do
#     az vm disk attach --vm-name crawler_${i} --name crawl_disk_${i} --new --sku Standard_LRS --size-gb 512 --resource-group webarchive_crawler  &
# done

# echo 'Done attaching disks'
