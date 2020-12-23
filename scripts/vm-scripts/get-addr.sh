

az vm list-ip-addresses -g $1 | jq -r '.[].virtualMachine | "\(.name) \(.network.publicIpAddresses | .[].ipAddress)"'