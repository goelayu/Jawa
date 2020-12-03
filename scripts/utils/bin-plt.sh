# This script takes in a plt | network data
# and computes median plt for every bin of network

min=`cat $1 | awk 'BEGIN{a=10000}{if (a>$3)a=$3} END{print a}  '`
max=`cat $1 | awk 'BEGIN{a=0}{if (a<$3)a=$3} END{print a}'`
# echo min is $min $max
step=$2
min=$3 
max=$4

for i in $(seq $min $step $max); do 
    echo -n $i" ";cat $1 | awk -v min=$i -v max=$(($i+$step)) '{if (NF == 3 && $3 >= min && $3 < max ) print $2/1000}' | median2
    echo ''
done