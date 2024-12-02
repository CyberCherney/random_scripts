#!/bin/bash
# USAGE: 
#
# auto script for the way I perform bug bounties
# scans and enums subdomains then filters based off scope
# screencaps and nmap scans active scoped domains/IPs
# 
# 
# TODO
#   add IP scope filterer
#   add nmap scan (of scoped IPs)
#   add GitRob running
#   add wayback machine scanning of domain homepages and /robots.txt


# checks for tool installation
# mostly added this if I ever need to use this on another VM or device
function tool_check() {

    uninstalled=()
    tools=("knockpy" "assetfinder" "httprobe" "gowitness" "gitrob")

    for tool in ${tools[*]}; do
        check=`whereis $tool | sed "s/$tool://g"`
        if [[ $check == '' ]]; then
            uninstalled+=$tool","
        fi
    done

    if [[ ${#uninstalled} == 0 ]]; then
        echo "[+] All tools are properly installed."
        return
    else
        echo ${uninstalled[*]}
    fi

}


# installs tools and places them into common places
function tool_install() {

    uninstalled=`tool_check`

    if [[ $uninstalled == "[+] All tools are properly installed." ]]; then
        echo $uninstalled
        return
    fi

    echo "[-] Some tools are missing please hold."
    uninstalled=`echo $uninstalled | sed 's/,/ /g'`

    if  ! whereis go | grep -q "/go";then
        echo "[!] Please install go before running this script"
        echo "https://go.dev/doc/install"
        exit 1
    fi

    for tool in $uninstalled; do
        case $tool in
            knockpy)
                echo "==> Installing knockpy with pip"
                pip install git+https://github.com/guelfoweb/knock.git -q --user
                ;;
            assetfinder)
                echo "==> Installing assetfinder"
                go get github.com/tomnomnom/assetfinder@latest
                ;;
            httprobe)
                echo "==> Installing httprobe"
                go get github.com/tomnomnom/httprobe@latest
                ;;
            gowitness)
                echo "==> Installing gowitness"
                go get github.com/sensepost/gowitness@latest
                ;;
            gitrob)
                echo "==> Installing Gitrob"
                loopback=`pwd`
                cd /home/$USER/Downloads
                mkdir gitrob
                cd gitrob
                wget https://github.com/michenriksen/gitrob/releases/download/v2.0.0-beta/gitrob_linux_amd64_2.0.0-beta.zip
                unzip gitrob_linux_amd64_2.0.0-beta.zip
                mv gitrob /home/$USER/go/bin/
                rm README.md
                rm rm gitrob_linux_amd64_2.0.0-beta.zip
                cd $loopback
                rmdir /home/$USER/Downloads/gitrob
                ;;
        esac
    done

}


# makes directories
function init() {

    echo "[+] Initializing directories and files."

    domain=$1

    # set up files and directories for check loop
    directories=("$domain" "$domain/recon" "$domain/recon/domains" "$domain/recon/httprobe" "$domain/recon/gowitness" "$domain/recon/nmap")
    files=("$domain/in.scope" "$domain/out.scope" "$domain/recon/domains/assetfinder.domains" "$domain/recon/domains/knockpy.domains" "$domain/recon/httprobe/alive.domains" "$domain/recon/tmp.domains" "$domain/allowed.inscope" "$domain/recon/nmap/tmp.ips" "$domain/recon/nmap/ip.inscope" "$domain/recon/httprobe/tmp.alive")

    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir $dir
        fi 
    done

    for file in "${files[@]}"; do
        if [ ! -f "$file" ]; then
            touch $file
        fi 
    done

}


# takes in.scope and out.scope and filters tmp.domain
function scope_filter() {

    domain=$1

    echo "[+] Filtering found assets with defined scope."

    echo "[+] Removing out of scope objects."
    while read -r line || [[ -n $line ]]; do
        # turns domain.com into domain\.com for regex filtering
        prep=`echo $line | sed 's/\./\\\./g'`
        if [[ `echo $line | grep -e "^*" | grep -e "*$"` != '' ]]; then
            # handles *.domain.*
            sed -i "/${prep:1:-1}/d" $domain/recon/tmp.domains
        elif [[ `echo $line | grep -e "^*"` != '' ]]; then
            # handles *.domain
            sed -i "/${prep:1}$/d" $domain/recon/tmp.domains
        elif [[ `echo $line | grep -e "*$"` != '' ]]; then
            # handles domain.*
            sed -i "/^${prep::-1}/d" $domain/recon/tmp.domains
        else
            # end case is likely domain.com
            sed -i "/^$prep$/d" $domain/recon/tmp.domains
            sed -i "/\.$prep$/d" $domain/recon/tmp.domains
        fi
    done < "$domain/out.scope"

    echo "[+] Adding in scope items."
    while read line || [[ -n $line ]]; do
        # turns domain.com into domain\.com for regex filtering
        prep=`echo $line | sed 's/\./\\\./g'`
        if [[ `echo $line | grep -e "^*" | grep -e "*$"` != '' ]]; then
            # handles *.domain.*
            cat $domain/recon/tmp.domains | grep -e "${prep:1:-1}" >> $domain/allowed.inscope
        elif [[ `echo $line | grep -e "^*"` != '' ]]; then
            # handles *.domain
            cat $domain/recon/tmp.domains | grep -e "${prep:1}$" >> $domain/allowed.inscope
        elif [[ `echo $line | grep -e "*$"` != '' ]]; then
            # handles domain.*
            cat $domain/recon/tmp.domains | grep -e "^${prep::-1}" >> $domain/allowed.inscope
        else
            # end case is likely domain.com
            cat $domain/recon/tmp.domains | grep -e "^$prep$" >> $domain/allowed.inscope
        fi
    done < "$domain/in.scope"

}


# uses knockpy and assetfinder to scan domains
# adds to tmp.domains for filtering
function domain_scan() {

    echo "[+] Scanning with assetfinder."
   
    while IFS= read -r line || [[ -n $line ]]; do
        if [[ `echo $line | grep -e "^*"` != '' ]]; then
            wildcard_asset=${line:2}
            assetfinder $wildcard_asset >> $1/recon/domains/assetfinder.domains
        else
            assetfinder $line >> $1/recon/domains/assetfinder.domains
        fi
    done < "$1/in.scope"
    
    cat $1/recon/domains/assetfinder.domains | sort -u > $1/recon/tmp.domains

    echo "[+] Fetching IPs and additional info with knockpy."
    knockpy -f $1/recon/tmp.domains > $1/recon/domains/knockpy.domains
    
    scope_filter $1

}


# probes for alive domains then screenshots
# gowitness has some issues with screencapping certain sites, probably a captcha it can't pass or something
function screen_cap() {

    domain=$1

    echo "[+] Probing for alive domains."
    cat $1/allowed.inscope | sort -u | httprobe -p https:443 | sed 's/https\?:\/\///' | tr -d ':443' >> $domain/recon/httprobe/tmp.alive
    sort -u $domain/recon/httprobe/tmp.alive > $domain/recon/httprobe/alive.domains

    echo "[+] Taking screenshots of alive domains."
    gowitness file -f $domain/allowed.inscope
    mv screenshots $domain/recon/gowitness
    mv gowitness.sqlite3 $domain/recon/gowitness

}


function main() {

    check=tool_check | sed 's/,/ /g'

    if [[ $check != '' ]]; then
        echo "[!] The following tools are missing:"
        echo $check
        echo "[!] To auto install run the -i flag"
        exit 1
    fi

    read -p "[?] Enter the program name: " program
    init $program
    read -p "[?] Place scope items in the $program directory's respective files. Press enter when done."

    domain_scan $program
    screen_cap $program

}


while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tool-check)
            tool_check
            shift
            ;;
        -i|--install-tools)
            tool_install
            shift
            ;;
        -r|--run-scans)
            main
            shift
            ;;
        *)
            echo "USAGE:"
            echo "-t or --tool-check to check if required tools are installed"
            echo "-i or --install-tools to install missing tools"
            echo "-r or --run-scans to start the tool"
            exit 1
            ;;
    esac
done
