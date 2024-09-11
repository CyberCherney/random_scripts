#!/bin/bash
# 
# 
# 

read -p "Enter the box name: " box
prefix="$box""_"
directory="$box""-ordered"

mkdir $directory

for line in `ls | grep "$box""_"`; do
    modify_time=`stat $line | grep "Modify: " | sed "s/Modify: //g"`
    concat="$modify_time ""$line"
    echo "$concat" >> $directory/to_be_sorted
done

i=1
IFS=$'\t\n'
for line in $(cat $directory/to_be_sorted | sort -u); do
    img=`echo "$line" | cut -b 37-`
    stripped=`echo $img | sed "s/$prefix//g"`
    new_name="$prefix""$i""_""$stripped"
    cp $img $directory/$new_name
    ((i++))
done


