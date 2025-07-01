#!/bin/bash
# 
# image ordering script to reduce some time in my workflow
# takes a directory full of images with a definable prefix (ex. hatrick_dashboard.png)
# then sorts them based on when last they were modified (in other words created)
# numbers them for easier placement in writeups (ex. hatrick_1_dashboard.png)
# starts httpserver module in python since I hack in VMs

set -euo pipefail

read -rp "Enter the box name: " box
prefix="$box""_"
directory="$box""-ordered"

mkdir "$directory"
tmpfile=$(mktemp)
trap 'rm -f "$tmpfile"' EXIT

for line in "$box"_*; do
    modify_time=$(stat -c "%Y" "$line")
    concat="$modify_time ""$line"
    echo "$concat" >> "$tmpfile"
done

i=1
count=$(ls "$box"_* | wc -l)
length=${#count}

while read -r _ img; do
    stripped=$(echo $img | sed "s/^$prefix//g")
    formatted_i=$(printf "%0$length""d" "$i")
    new_name="$prefix""$formatted_i""_""$stripped"
    mv "$img" "$directory/$new_name"
    ((i++))
done < <(sort -n "$tmpfile")


# this part is specifically for my environment 
# remove or modify if you intend to use

cd "$directory"

echo "Server is up, run the following command, then Ctrl+C when done:"
echo "wget -r http://192.168.2.69:8081/"
echo "" 
python3 -m http.server 8081
read -p "Hit Enter for cleanup."

cd ..
mv "$directory" transfer
