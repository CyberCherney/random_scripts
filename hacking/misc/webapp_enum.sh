#!/bin/bash
# tools needed for this script:
# assetfinder, amass*, httprobe, gowitness, google chrome in $PATH
# simple subdomain scanner, filtering, and screenshotting script


url=$1
base=("$url" "$url/recon")

for dir in "${base[@]}"; do
    if [ ! -d "$dir" ];then
        mkdir $dir
    fi
done

root="$url/recon"

directories=("httprobe" "scans" "gowitness" "potential_takeovers" "wayback" "wayback/params" "wayback/extensions")

for dir in "${directories[@]}"; do
    if [ ! -d "$root/$dir" ];then
        mkdir "$root/$dir"
    fi
done

if [ ! -f "$root/final.txt" ];then
    touch "$root/final.txt"
fi

if [ ! -f "$root/httprobe/alive.txt" ];then
    touch "$root/httprobe/alive.txt"
fi

echo "[+] Finding subdomains with assetfinder"
assetfinder $url >> $url/recon/assets.txt
cat $url/recon/assets.txt | grep $1 >> $url/recon/final.txt
rm $url/recon/assets.txt

: '
echo "[+] Finding subdomains with amass"
amass enum -d $url >> $url/recon/f.txt
sort -u $url/recon/f.txt >> $url/recon/final.txt
rm $url/recon/f.txt
'

echo "[+] Probing for live endpoints with httprobe"
cat $url/recon/final.txt | sort -u | httprobe -s -p https:443 | sed 's/https\?:\/\///' | tr -d ':443' >> $url/recon/alive.txt
