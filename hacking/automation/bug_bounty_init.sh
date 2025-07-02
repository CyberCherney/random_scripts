#!/bin/bash
# USAGE: 
#
# auto script for the way I perform bug bounties
# scans and enums subdomains then filters based off scope
# screencaps and nmap scans active scoped domains/IPs
# makes a mindmap from a python script
# add a gitrob github token with `gitrob -github-access-token TOKEN` if you intend to use gitrob
#
# TODO
#   add IP scope filterer
#   add nmap scan (of scoped IPs)
#   add GitRob running

set -euo pipefail

# checks for tool installation
# mostly added this if I ever need to use this on another VM or device
function tool_check() {
    uninstalled=()
    tools=("knockpy" "assetfinder" "httprobe" "gowitness" "gitrob" "waymore")

    for tool in "${tools[@]}"; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            uninstalled+=("$tool")
        fi
    done

    if [[ ${#uninstalled[@]} -eq 0 ]]; then
        echo "[+] All tools are properly installed."
        return 0
    else
        printf '%s,' "${uninstalled[@]}" | sed 's/,$//'
        return 1
    fi

}


# installs tools and places them into common places
function tool_install() {

    uninstalled=$(tool_check)

    if [[ $uninstalled == "[+] All tools are properly installed." ]]; then
        echo "$uninstalled"
        return
    fi

    echo "[-] Some tools are missing please hold."
    uninstalled=$(echo $uninstalled | sed 's/,/ /g')

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
                loopback=$(pwd)
                cd /home/$USER/Downloads
                mkdir gitrob
                cd gitrob
                wget https://github.com/michenriksen/gitrob/releases/download/v2.0.0-beta/gitrob_linux_amd64_2.0.0-beta.zip
                unzip gitrob_linux_amd64_2.0.0-beta.zip
                mv gitrob /home/$USER/go/bin/
                rm README.md
                rm gitrob_linux_amd64_2.0.0-beta.zip
                cd $loopback
                rmdir /home/$USER/Downloads/gitrob
                ;;
            waymore)
                echo "==> Installing Waymore"
                pip install waymore -q --user
                ;;
        esac
    done

}


# makes directories
function init() {


    local domain=$1

    if [ -z "$domain" ]; then
        echo "[!] Domain parameter is required"
        return 1
    fi

    echo "[+] Initializing directories and files."

    # set up files and directories for check loop
    directories=("$domain" "$domain/passive_recon" "$domain/passive_recon/domains" "$domain/passive_recon/httprobe" "$domain/passive_recon/gowitness" "$domain/passive_recon/nmap" "$domain/passive_recon/waymore" "$domain/passive_recon/gitrob")
    files=("$domain/in.scope.md" "$domain/out.scope.md" "$domain/passive_recon/domains/assetfinder.domains.md" "$domain/passive_recon/domains/knockpy.domains.md" "$domain/passive_recon/httprobe/alive.domains.md" "$domain/passive_recon/tmp.domains.md" "$domain/allowed.inscope.md" "$domain/passive_recon/nmap/tmp.ips.md" "$domain/passive_recon/nmap/ip.inscope.md" "$domain/passive_recon/httprobe/tmp.alive.md")

    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir "$dir"
        fi 
    done

    for file in "${files[@]}"; do
        if [ ! -f "$file" ]; then
            touch "$file"
        fi 
    done

}


# takes in.scope.md and out.scope.md and filters tmp.domain
function scope_filter() {
    local domain="$1"

    if [ ! -f "$domain/out.scope.md" ] || [ ! -f "$domain/in.scope.md" ]; then
        echo "[!] Scope files not found"
        return 1
    fi

    echo "[+] Filtering found assets with defined scope."

    echo "[+] Removing out of scope objects."
    while read -r line || [[ -n $line ]]; do
        # Skip empty lines
        if [[ -z "$line" ]]; then
            continue
        fi
        
        # turns domain.com into domain\.com for regex filtering
        prep=$(echo "$line" | sed 's/\./\\\./g')
        if [[ $(echo "$line" | grep -e "^*" | grep -e "*$") != '' ]]; then
                    # handles *.domain.*
        sed -i "/${prep:1:-1}/d" "$domain/passive_recon/tmp.domains.md"
    elif [[ $(echo "$line" | grep -e "^*") != '' ]]; then
        # handles *.domain
        sed -i "/${prep:1}$/d" "$domain/passive_recon/tmp.domains.md"
    elif [[ $(echo "$line" | grep -e "*$") != '' ]]; then
        # handles domain.*
        sed -i "/^${prep::-1}/d" "$domain/passive_recon/tmp.domains.md"
    else
        # end case is likely domain.com
        sed -i "/^$prep$/d" "$domain/passive_recon/tmp.domains.md"
        sed -i "/\.$prep$/d" "$domain/passive_recon/tmp.domains.md"
        fi
    done < "$domain/out.scope.md"

    echo "[+] Adding in scope items."
    while read -r line || [[ -n $line ]]; do
        # Skip empty lines
        if [[ -z "$line" ]]; then
            continue
        fi
        
        # turns domain.com into domain\.com for regex filtering
        prep=$(echo "$line" | sed 's/\./\\\./g')
        if [[ $(echo "$line" | grep -e "^*" | grep -e "*$") != '' ]]; then
                    # handles *.domain.*
        cat "$domain/passive_recon/tmp.domains.md" | grep -e "${prep:1:-1}" >> "$domain/allowed.inscope.md"
    elif [[ $(echo "$line" | grep -e "^*") != '' ]]; then
        # handles *.domain
        cat "$domain/passive_recon/tmp.domains.md" | grep -e "${prep:1}$" >> "$domain/allowed.inscope.md"
    elif [[ $(echo "$line" | grep -e "*$") != '' ]]; then
        # handles domain.*
        cat "$domain/passive_recon/tmp.domains.md" | grep -e "^${prep::-1}" >> "$domain/allowed.inscope.md"
    else
        # end case is likely domain.com
        cat "$domain/passive_recon/tmp.domains.md" | grep -e "^$prep$" >> "$domain/allowed.inscope.md"
        fi
    done < "$domain/in.scope.md"

    sort "$domain/allowed.inscope.md" -o "$domain/allowed.inscope.md"
}


# uses knockpy and assetfinder to scan domains
# adds to tmp.domains.md for filtering
function domain_scan() {

    echo "[+] Scanning with assetfinder."
   
    while IFS= read -r line || [[ -n $line ]]; do
        if [[ $(echo "$line" | grep -e "^*") != '' ]]; then
            wildcard_asset=${line:2}
            assetfinder "$wildcard_asset" >> "$1/passive_recon/domains/assetfinder.domains.md"
        else
            assetfinder "$line" >> "$1/passive_recon/domains/assetfinder.domains.md"
        fi
    done < "$1/in.scope.md"
    
    cat "$1/passive_recon/domains/assetfinder.domains.md" | sort -u > "$1/passive_recon/tmp.domains.md"

    scope_filter "$1"

    echo "[+] Fetching IPs and additional info with knockpy."
    knockpy -f "$1/passive_recon/tmp.domains.md" > "$1/passive_recon/domains/knockpy.domains.md"

}


# probes for alive domains
function alive_probe() {
    domain=$1

    echo "[+] Probing for alive domains."
    cat $1/allowed.inscope.md | sort -u | httprobe -p https:443 | sed 's/https\?:\/\///' | tr -d ':443' >> $domain/passive_recon/httprobe/tmp.alive.md
    sort -u $domain/passive_recon/httprobe/tmp.alive.md > $domain/passive_recon/httprobe/alive.domains.md

}


# screenshots alive domains
# gowitness has some issues with screencapping certain sites, probably a captcha it can't pass or something
function screen_cap() {
    domain=$1

    echo "[+] Taking screenshots of alive domains."
    gowitness file -f $domain/passive_recon/httprobe/alive.domains.md --threads 30
    mv screenshots $domain/passive_recon/gowitness
    mv gowitness.sqlite3 $domain/passive_recon/gowitness

    #post gowitness scan the database can be used to filter more precisely:
    #.output 404.md
    #SELECT url FROM urls WHERE response_reason LIKE "404 Not Found";
    #.output stdout
    #cat 404.md | sed 's~http[s]*://~~g' > tmp
    #cd screenshot
    #cat ../tmp | while read line; do mv "http-$line.png" 404; done

}


# finds URLs from a variety of sources
# needs to filter the root domains and pass them to waymore
# https://github.com/xnl-h4ck3r/waymore for more about how it does that
# useful for finding parameters or apis that either used to exist or currently do
function passive_url_finder() {
    local domain="$1"

    echo "[+] Finding URLs with waymore."
    
    echo "[+] Extracting root domains for waymore scanning..."
    local -A unique_roots=()
    
    while read -r domain_name; do
        if [[ -n "$domain_name" ]]; then
            local root=$(echo "$domain_name" | awk -F'.' '{
                if (NF >= 2) {
                    print $(NF-1) "." $NF
                } else {
                    print $0
                }
            }')
            unique_roots["$root"]=1
        fi
    done < "$domain/allowed.inscope.md"
    
    # Save unique root domains to file
    local root_domains_file="$domain/passive_recon/waymore/root_domains.txt"
    > "$root_domains_file"  # Clear the file
    
    for root in "${!unique_roots[@]}"; do
        echo "$root" >> "$root_domains_file"
    done
    
    echo "[+] Found $(wc -l < "$root_domains_file") unique root domains"
    echo "[+] Root domains saved to: $root_domains_file"
    
    # Run waymore on root domains instead of all subdomains
    cat "$root_domains_file" | xargs -n1 -P10 -I{} waymore -i {} -mode U -oU "$domain/passive_recon/waymore/{}.md > /dev/null 2>&1"
    find "$domain"/passive_recon/waymore -type f -empty -delete

}


# scans GitHub repositories for exposed secrets
# requires GitHub token with public_repo scope
function gitrob_scan() {
    local domain="$1"
    
    echo "[+] Scanning GitHub repositories for exposed secrets."
    
    # Check if GitHub token is set
    if [[ -z "${GITHUB_TOKEN:-}" ]]; then
        echo "[!] GITHUB_TOKEN environment variable not set."
        echo "[!] Set it with: export GITHUB_TOKEN='your_token_here'"
        echo "[!] Skipping Gitrob scan."
        return 1
    fi
    
    # Extract organization names from domains
    # This is a simple approach - you might want to customize this logic
    local orgs=()
    while read -r domain_name; do
        # Extract potential org names (e.g., tesla.com -> tesla, teslamotors.com -> teslamotors)
        local org=$(echo "$domain_name" | cut -d'.' -f1)
        if [[ -n "$org" && ! " ${orgs[@]} " =~ " ${org} " ]]; then
            orgs+=("$org")
        fi
    done < "$domain/allowed.inscope.md"
    
    if [[ ${#orgs[@]} -eq 0 ]]; then
        echo "[-] No organizations found to scan."
        return 1
    fi
    
    echo "[+] Found organizations to scan: ${orgs[*]}"
    
    # Configure Git for better compatibility with newer repositories
    git config --global protocol.version 2
    
    # Scan each organization
    for org in "${orgs[@]}"; do
        echo "[+] Scanning organization: $org"
        gitrob -save "$domain/passive_recon/gitrob/${org}_gitrob.json" "$org"
    done
    
    echo "[+] Gitrob scan completed. Results saved to $domain/passive_recon/gitrob/"
}


function main() {

    check=$(tool_check)
    
    if [[ "$check" != "[+] All tools are properly installed." ]]; then
        echo "[!] The following tools are missing:"
        echo "$check"
        echo "[!] To auto install run the -i flag"
        exit 1
    fi

    read -rp "[?] Enter the program name: " program
    if [ -z "$program" ]; then
        echo "[!] Program name cannot be empty"
        exit 1
    fi
    
    init "$program"
    read -rp "[?] Place scope items in the $program directory's respective files. Press enter when done."

    domain_scan "$program"
    alive_probe "$program"
    #screen_cap "$program"

    if [ -f "/opt/domain_mindmaper.py" ]; then
        echo "[+] Creating mindmap for Obsidian."
        python3 /opt/domain_mindmaper.py "$program/allowed.inscope.md" "$program/domain_mindmap.md"
    else
        echo "[-] /opt/domain_mindmapper.py not found, change location in script to run."
    fi

    passive_url_finder "$program"
    
    # be sure to add a github token with `export GITHUB_TOKEN="ghp_your_token_here"` in ~/.bashrc
    # gitrob_scan "$program"

}


function show_help() {
    cat << EOF
USAGE: $0 [OPTIONS]

OPTIONS:
    -t, --tool-check     Check if required tools are installed
    -i, --install-tools  Install missing tools (requires go)
    -r, --run-scans      Start the reconnaissance process
    -h, --help           Show this help message

EOF
}


if [[ $# -eq 0 ]]; then
    show_help
    exit 1
fi

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
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "[!] Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done
