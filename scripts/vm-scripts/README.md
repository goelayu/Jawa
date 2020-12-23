
### Initializing VMs for large-scale crawling

These scripts set up a finite number of VMs and then launch crawl jobs on each of them

Launch VMs

```sh
./launch-init-vm.sh <number-of-vms>
```

Get addresses
```sh
./get-addr.sh <resource-group-name> 
```

Sort the addresses by crawler name
```sh
./get-addr.sh <resource-group-name> | sort -nk1.9
```
Mount disks on each of the VMs
```sh
 while read i; do
    addr=`echo $i | cut -d' ' -f2`; ssh -o StrictHostKeyChecking=no $addr "bash -s" < vm-scripts/mount-disk.sh & 
done<address-mapping-of-crawlers
```

Run crawl jobs on each of the VMs (Currently this is configured to crawl exactly two sites per VM)
```sh
./run-cmd.sh <address-map-of-crawlers>
```
