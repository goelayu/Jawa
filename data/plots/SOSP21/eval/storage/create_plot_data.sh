#!/bin/bash

set -eE -o functrace


failure() {
  local lineno=$1
  local msg=$2
  echo "Failed at $lineno: $msg"
}
trap 'failure ${LINENO} "$BASH_COMMAND"' ERR

# $1 -> is the main file

sites=`cat $1 | awk '{print $1}' | sort | uniq | wc -l`
echo Total sites to be processed $sites

#init plots
echo plt, network > js_store
echo plt, network > csize
echo plt, network > ssize
echo plt, network > all_store

echo plt > js_dedup

echo plt, network > lookup
echo plt, network> lookup_filter
echo plt, network > lookup_relative
echo plt, network > cthru
count=1
cat $1 | awk '{print $1}' | sort | uniq | \
while read site; do 
	orig_line=`cat $1 | grep $site | head -n3 | tail -n1`; orig=`echo $orig_line | awk '{printf "%.3f", $7/(1000*1000)}'` ; echo $orig,IA >> js_store
	soln_line=`cat $1 | grep $site | head -n4 | tail -n1`; soln_len=`echo $soln_line | awk '{print NF}'`;
	if [[ $soln_len != 14 ]]; then echo incorrect data, $site; continue; fi
	echo soln line is $soln_line
	# unionAll=`cat $1 | grep $site | head -n5 | tail -n1 | awk '{printf "%f.3", $3/(1000*1000)}'`;
	echo $soln_line | awk '{printf "%.3f", $8/(1000*1000); print ",IA+Filter" }' >> js_store
	# # echo $soln_line | awk '{print $10/(1000*1000),",Fn" }' >> js_store
	# # echo $soln_line | awk '{print $12/(1000*1000),",Fn_Dedup" }' >> js_store
	echo $soln_line | awk '{printf "%.3f", $14/(1000*1000); print ",Jawa" }' >> js_store
	# # echo $unionAll,Fn_Union >> js_store

	# ind_orig=`cat $1 | grep $site | tail -n6 |head -n1`;
	# ind_union=`cat $1 | grep $site | tail -n5 | head -n1`;
	# echo $ind_orig | awk '{print $3/(1000*1000),",Original"}' >> csize
	# echo $ind_orig | awk '{print $5/(1000*1000),",Original"}' >> ssize
	# echo $ind_union | awk '{print $3/(1000*1000),",System"}' >> csize
	# echo $ind_union | awk '{print $5/(1000*1000),",System"}' >> ssize

	# lookup=`cat $1 | grep $site | tail -n4 | head -n1`;
	# lookup_filter=`cat $1 | grep $site | tail -n3 | head -n1`;
	# lookup_relative=`cat $1 | grep $site | tail -n2 | head -n1`;
	# echo $lookup | awk '{print $2,",10th-P"}' >> lookup
	# echo $lookup | awk '{print $3,",50th-P"}' >> lookup
	# echo $lookup | awk '{print $4,",90th-P"}' >> lookup

	# echo $lookup_filter | awk '{print $2,",10th-P"}' >> lookup_filter
	# echo $lookup_filter | awk '{print $3,",50th-P"}' >> lookup_filter
	# echo $lookup_filter | awk '{print $4,",90th-P"}' >> lookup_filter

	# echo $lookup_relative | awk '{print $2,",10th-P"}' >> lookup_relative
	# echo $lookup_relative | awk '{print $3,",50th-P"}' >> lookup_relative
	# echo $lookup_relative | awk '{print $4,",90th-P"}' >> lookup_relative

	# # echo -n $count" " >> lookup; echo $lookup | awk '{print $2, $3, $4}' >> lookup 

	# cthru=`cat $1 | grep $site | tail -n1 | head -n1`;
	# echo $cthru | awk '{print $2,",10th-P"}' >> cthru
	# echo $cthru | awk '{print $3,",50th-P"}' >> cthru
	# echo $cthru | awk '{print $4,",90th-P"}' >> cthru

	dedup=`cat t | grep $site | head -n1`; otherTotal=`echo $dedup | awk '{print ($6+$8+$10)/(1000*1000)}'`;
	# echo $orig $otherTotal ; echo $orig $otherTotal | awk '{print $1/($1+$2/(1000*1000))}' >>js_dedup 

	echo $orig $otherTotal | awk '{print $1+$2,",IA"}' >> all_store
	soln=`echo $soln_line | awk '{print $14/(1000*1000)}'`;

	echo $soln $otherTotal | awk '{print $1+$2,",Jawa"}' >> all_store

	count=$(($count+1))


done


#sanitize data

# ./multi_cdf_jsstore.R js_store js_store.pdf
# ./cdf_all_store.r all_store all_store.pdf
# ./cdf_csize.r csize csize.pdf
# ./cdf_ssize.r ssize ssize.pdf
# # ./cdf_lookups.r lookup lookup.pdf
# # ./cdf_lookups_filter.r lookup_filter lookup_filter.pdf
# ./cdf_lookups_rel.r lookup_relative lookup_relative.pdf


