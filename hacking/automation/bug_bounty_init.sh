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
#   fix install enumall
#   add eyewitness, zaproxy, gitrob
#   add knockpy and enumall scans
#   add scope filterer
#   add Eyewitness (of scoped domains)
#   add ZAP proxy start
#   add nmap scan (of scoped IPs)
#   add GitRob running


# checks for tool installation
# mostly added this if I ever need to use this on another VM or device
function tool_check() {

uninstalled=()
tools=("knockpy" "enumall" "EyeWitness" "zaproxy" "gitrob")

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

for tool in $uninstalled; do
    case $tool in
        knockpy)
            echo "==> Installing knockpy with pip"
            pip install git+https://github.com/guelfoweb/knock.git -q --user
            ;;
        enumall)
            echo "==> Installing enumall.py & dependencies"
            path="/home/$USER/.local/git"
            mkdir $path
            loopback=`pwd`
            cd $path
            git clone -q https://github.com/methos2016/recon-ng.git
            pip install -r recon-ng/REQUIREMENTS
            git clone -q https://github.com/infosec-au/altdns.git
            git clone -q https://github.com/jhaddix/domain.git
            cd domain
            pathSed=$(echo $path | sed s/'\/'/'\\\/'/g)
            sed -i "s/\/usr\/share\/recon-ng\//$pathSed\/recon-ng\//g" enumall.py
            sed -i "s/\/root\/Desktop\/altdns-master\//$pathSed\/altdns\//g" enumall.py
            chmod 755 enumall.py
            cp enumall.py ~/.local/bin/enumall
            cd $loopback
            ;;
        EyeWitness)
            echo "==> Installing EyeWitness.py"
            ;;
        zaproxy)
            echo "==> Installing zaproxy"
            ;;
        gitrob)
            echo "==> Installing Gitrob"
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

read -p "Enter the domain name: " program
mkdir $program
touch $program/in.scope $program/out.scope

read -p "Place scope items in the $program directory's respective files. Press enter when done."



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
