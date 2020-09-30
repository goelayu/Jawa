#Processes a chrome network file to
#estimate the RTT using SSL connection timing information

# $1 = path to the network file

jq -r '.[] | .["Network.responseReceived"].response.timing | "\(.sslEnd) \(.sslStart)"' $1\
  | grep -v null   | awk '{if ($1 != -1) print $1 - $2}' | median