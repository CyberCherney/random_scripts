#!/bin/bash
# USAGE: 
# please don't run as root unless you plan to use the tools as root
# it deals with installing pip and go packages and being a different user messes it up
#
# auto script for the way I perform bug bounties
# scans and enums subdomains then filters based off scope
# starts zap for Forced Browse
# screencaps and nmap scans active scoped domains/IPs
# 
# 
# TODO

#   add eyewitness, zaproxy, gitrob
#   add httprobe install/usage
#   add knockpy and enumall scans
#   add scope filterer
#   add gowitness (of scoped domains)
#   add ZAP proxy start
#   add nmap scan (of scoped IPs)
#   add GitRob running


# checks for tool installation
# mostly added this if I ever need to use this on another VM or device
function tool_check() {

uninstalled=()
tools=("knockpy" "assetfinder" "httprobe" "gowitness" "zaproxy" "gitrob")

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
        zaproxy)
            echo "==> Installing zaproxy"
            sudo apt install default-jre
            loopback=`pwd`
            cd /home/$USER/Downloads
            wget https://github.com/zaproxy/zaproxy/releases/download/v2.15.0/ZAP_2_15_0_unix.sh
            echo "==> Follow Installer"
            sudo bash ZAP_2_15_0_unix.sh
            wait
            rm ZAP_2_15_0_unix.sh
            cd $loopback
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


# uses knockpy and enumall to scan subdomains
# adds to file sub.domains for filtering
function subdomain_scan() {

echo sub

}


function main() {

check=tool_check | sed 's/,/ /g'

if [[ $check != '' ]]; then
    echo "[!] The following tools are missing:"
    echo $check
    echo "[!] To auto install run the -i flag"
    exit 1
fi

read -p "[?] Enter the domain name: " program
mkdir $program
touch $program/in.scope $program/out.scope

read -p "[?] Place scope items in the $program directory's respective files. Press enter when done."



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
    esac
done
