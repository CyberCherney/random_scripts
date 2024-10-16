#!/bin/bash
# script to initially enumerate machines for various hacking challenges
# baked the old webapp_enum.sh into this

# TODO:
# fix script outputs
# mute all scan progress
# add timestamps/spinning wheel
# prettify the steps
# solve issue if ffuf spits out hundreds of 200s
# change nmap to rustscan
# format results file to be markdown copy paste ready

function subdomain_scan() {
    domain="$1"
    if [ ! -f trash/subdomains.scan ]; then
        echo "Scanning subdomains:"
        ffuf -w /opt/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt -u http://$domain -H "Host: FUZZ.$domain" -mc 200,401 -of json -o trash/subdomains.scan | tee >> trash/subdomains.alive
    fi
    subdomains=$(jq ".results[].host" trash/subdomains.scan | sed 's/"//g')
    if [ ! -z "$subdomains" ]; then
        echo "$subdomains"
        read -p "Add the above domains to /etc/hosts"
        for line in $subdomains; do
            if [ ! -f trash/dirsearch/$line.scan ]; then
                echo "dirsearching $line:"
                dirsearch -u $line -o trash/dirsearch/$line.scan -x 400,404
                if [ ! -f trash/dirsearch/$line.scan ]; then
                    touch trash/dirsearch/$line.scan
                fi
                echo "Screenshotting $line"
                echo "$line" | gowitness file -f -
            fi
        done
    fi
}


# Rough IP filter

if [ "$#" -gt 0 ]; then
    if ! echo "$1" | grep -E "^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$"; then
        echo "Enter a valid IP"
        exit 1
    else
	      IP=$1
	  fi
else
	read -p "Enter the IP: " IP
    if ! echo "$IP" | grep -E "^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$"; then
        echo "Enter a valid IP"
        exit 1
    fi
fi


# directory stuff for organization

if [ ! -f trash/results.trash ]; then
    mkdir trash
    mkdir trash/nmap
    mkdir trash/dirsearch
    mkdir trash/gowitness
    touch trash/results.trash
fi

# Finds open ports to work with in more depth

if [ ! -f trash/nmap/nmap_port_sweep.txt ]; then
    echo "Sweeping ports:"
    docker run -it --rm --name rustscan rustscan/rustscan:1.10.0 $IP | tee trash/nmap/nmap_port_sweep.txt
fi

open_ports=$(cat trash/nmap/nmap_port_sweep.txt | grep -oE "([0-9]+\.){3}[0-9]+:[0-9]+" | sed -E 's/([0-9]+\.){3}[0-9]+://g'  | sed -z 's/\n/,/')

if [ ! -f trash/nmap/nmap_scan.xml ]; then
    echo "Running real scan:"
    nmap -p$open_ports -sCV $IP -oX trash/nmap/nmap_scan.xml -oN trash/nmap/nmap_scan_output.txt
fi

domain=$(cat trash/nmap/nmap_scan.xml | grep -oE "(https?://)([a-zA-Z0-9]+\\\\?.)+[a-zA-Z]{2,10}" | sort -u | sed 's/\\././g' | sort -u)


if [ ! -z "$domain" ]; then
    domain_stripped=`echo $domain | grep -oE "[a-zA-Z0-9]+.[a-zA-Z]{2,10}$"`
    read -p "Add $domain_stripped to /etc/hosts then continue."
    subdomain_scan "$domain_stripped"
fi


webport=('80' '8080' '8000' '8081' '443' '8443' '3000')
for port in ${webport[@]}; do
    if echo $open_ports | grep -E "(^$port,)|(,$port,)|(,$port$)"; then
        if [ ! -f trash/dirsearch/$port.scan ]; then
            echo "dirsearching port $port:"
            dirsearch -u $IP:$port -o trash/dirsearch/$port.scan -x 400,404
            echo "Screenshotting if alive:"
            echo "$port" | gowitness file -f -
      fi
    fi
done

if [ -f gowitness.sqlite3 ]; then
    mv gowitness.sqlite3 trash/gowitness
    mv screenshots trash/gowitness
fi


# formatting the results file

cat trash/nmap/nmap_scan_output.txt >> trash/results.trash
echo "" >> trash/results.trash
echo "" >> trash/results.trash
cat trash/subdomains.alive >> trash/results.trash
echo "" >> trash/results.trash
echo "" >> trash/results.trash
cat trash/dirsearch/* >> trash/results.trash
