

# $1 -> directory containing resource files
# $3 -> output directory
# $2 -> url list 
echo $2
rollup=/home/goelayu/BACKUP/WebPeformance/bin/rollup
# while read url; do
url=$3
path=$1/$url
for file in `ls $path`; do 
    mkdir -p $2/$url/
    $rollup $path/$file/$file  --format iife --name "myBundle" --file $2/$url/$file 2>/dev/null &
    if ! test -f $2/$url/$file; then 
        cp $path/$file/$file $2/$url/$file
    fi
done
# done<"$3"