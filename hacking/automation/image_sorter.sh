#!/bin/bash
# 
# image ordering script to reduce some time in my workflow
# takes a directory full of images with a definable prefix
# then sorts them based on when last they were modified (in other words created)
# numbers them for easier placement in writeups
# starts httpserver module in python since I hack in VMs

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
IFS=$'\t\n' # makes the line search for new line instead of the default space
for line in $(cat $directory/to_be_sorted | sort -u); do
    img=`echo "$line" | cut -b 37-`
    stripped=`echo $img | sed "s/$$prefix//g"`
    new_name="$prefix""$i""_""$stripped"
    mv $img $directory/$new_name
    ((i++))
done

rm $directory/to_be_sorted


# this part is specifically for my environment 
# remove or modify if you intend to use

cd $directory

python3 -m http.server 8081
echo "Server is up, run the following command:"
echo "wget -r http://192.168.2.69:8081/"
echo "" 
read -p "Hit Enter when done for cleanup."

cd ..
mv $directory transfer
