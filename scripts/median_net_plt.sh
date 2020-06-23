
###
# 
#
#
#

# $1 -> List of urls
# $2 -> Input directory



cat $1 | cut -d/ -f3 | while read i; do
    # fast=`cat $2/$i | sort -nk1 | head -n 1 | awk '{print $3}'`;
    # slow=`cat $2/$i | sort -nrk1 | head -n 1 | awk '{print $3}'`;
    median=`cat $2/$i | awk '{print $2}' | median`
    medInt=`printf "%.0f\n" "$median"`
    # echo median is $medInt
    fast=`cat $2/$i | awk -v med=$medInt '{if ($2 == med) print $0}' | sort -nk1 | head -n 1 `
    slow=`cat $2/$i | awk -v med=$medInt '{if ($2 == med) print $0}' | sort -nrk1 | head -n 1 `
    # fast=`cat $2/$i | awk '{if ($1 == 0) print $2/1, $3, $0; else print $2/$1, $3, $0}' | sort -nk1 | head -n 1 | awk '{print $3}'`;
    # slow=`cat $2/$i | awk '{if ($1 == 0) print $2/1, $3, $0; else print $2/$1, $3, $0}' | sort -nrk1 | head -n 1 | awk '{print $3}'`;
    echo $fast $slow $i; 
done
