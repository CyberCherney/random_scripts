#!/bin/bash
# simple subdomain scanner, filtering, and screenshotting script
# tools needed for this script:
# assetfinder, amass*, httprobe, gowitness, google chrome in $PATH, subjack, waybackurls
#
# some of the above tools recommend using go get, instead use the following command format:
# go install github.com/haccer/subjack@latest


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
assetfinder $url >> $root/assets.txt
cat $root/assets.txt | sort -u | grep $1 >> $root/final.txt
rm $root/assets.txt

: '
echo "[+] Finding subdomains with amass"
amass enum -d $url >> $root/f.txt
sort -u $root/f.txt >> $root/final.txt
rm $root/f.txt
'

echo "[+] Probing for live endpoints with httprobe"
cat $root/final.txt | sort -u | httprobe -s -p https:443 | sed 's/https\?:\/\///' | tr -d ':443' >> $root/httprobe/a.txt
sort -u $root/httprobe/a.txt > $root/httprobe/alive.txt
rm $root/httprobe/a.txt

echo "[+] Checking for subdomain takeovers with subjack"

if [ ! -f "$root/potential_takeovers/potential_takeovers.txt" ];then
	touch $root/potential_takeovers/potential_takeovers.txt
fi

subjack -w $root/final.txt -t 100 -timeout 30 -ssl -c ~/go/pkg/mod/github.com/haccer/subjack@v0.0.0-20201112041112-49c51e57deab/fingerprints.json -v 3 -o $root/potential_takeovers/potential_takeovers.txt

echo "[+] Scanning for ports with nmap"
nmap -iL $root/httprobe/alive.txt -T4 -oA $root/scans/scanned.txt

echo "[+] Scraping the wayback with waybackurls"
cat $root/final.txt | waybackurls >> $root/wayback/wayback_output.txt
sort -u $root/wayback/wayback_output.txt

echo "[+] Compiling extentions "
cat $root/wayback/wayback_output.txt | grep '?*=' | cut -d '=' -f 1 | sort -u >> $root/wayback/params/wayback_params.txt
for line in $(cat $root/wayback/params/wayback_params.txt);do echo $line'=';done

echo "[+] Pulling and compiling js/php/aspx/jsp/json files from wayback output..."
for line in $(cat $root/wayback/wayback_output.txt);do
	ext="${line##*.}"
	if [[ "$ext" == "js" ]]; then
		echo $line >> $root/wayback/extensions/js1.txt
		sort -u $root/wayback/extensions/js1.txt >> $root/wayback/extensions/js.txt
	fi
	if [[ "$ext" == "html" ]];then
		echo $line >> $root/wayback/extensions/jsp1.txt
		sort -u $root/wayback/extensions/jsp1.txt >> $root/wayback/extensions/jsp.txt
	fi
	if [[ "$ext" == "json" ]];then
		echo $line >> $root/wayback/extensions/json1.txt
		sort -u $root/wayback/extensions/json1.txt >> $root/wayback/extensions/json.txt
	fi
	if [[ "$ext" == "php" ]];then
		echo $line >> $root/wayback/extensions/php1.txt
		sort -u $root/wayback/extensions/php1.txt >> $root/wayback/extensions/php.txt
	fi
	if [[ "$ext" == "aspx" ]];then
		echo $line >> $root/wayback/extensions/aspx1.txt
		sort -u $root/wayback/extensions/aspx1.txt >> $root/wayback/extensions/aspx.txt
	fi
done
 
rm $root/wayback/extensions/js1.txt
rm $root/wayback/extensions/jsp1.txt
rm $root/wayback/extensions/json1.txt
rm $root/wayback/extensions/php1.txt
rm $root/wayback/extensions/aspx1.txt

echo "[+] Screencapping compiled domains with gowitness"
gowitness file -f $root/final.txt
mv screenshots $root/gowitness
mv gowitness.sqlite3 $root/gowitness


