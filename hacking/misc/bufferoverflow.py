#!/usr/bin/python3.9

import socket
import sys
import argparse
from time import sleep

parser = argparse.ArgumentParser()
parser.add_argument('host', help="Server address")
parser.add_argument('port', type=int, help="Port of server")
args = parser.parse_args()

def connection_init():
    global s
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(2)
    check = s.connect_ex((args.host, args.port))

    if check:
        print('Issue connection to server: %s' % check)
        connection = False
    else:
        print(s.recv(1024).decode())
        connection = True
    return s,connection

def send_message(s, payload):
    s.send(payload.encode())


def overflow_tools():
    while True:
        tool = input('tools> ')
        if tool == 'fuzzer':
            command = input('Enter the command to fuzz: ')
            fuzzer(command)
        elif tool == 'manual':
            manual_fuzz()
        elif tool == 'shell':
            break
        elif tool == 'check':
            connection_init()
    return

def manual_fuzz():
    command = input('Enter command: ')
    chars = input('Enter number of characters to send: ')
    payload = ''.join([command, ' ', 'A' * int(chars)])
    s,connection = connection_init()
    send_message(s, payload)


def fuzzer(command):
    crash = ''
    buffer = ''
    rough_fuzzing = True
    fine_fuzzing = True
    while rough_fuzzing:
        try:
            crash = crash + 'A'*100
            payload = ''.join([command, ' ', crash])
            s,connection = connection_init()
            send_message(s, payload)
            print('%d %s' % (len(crash), s.recv(1024).decode()))
            buffer = crash
            sleep(1)
        except:
            print('Crashed between %d and %d bytes' % (len(buffer), len(crash)))
            rough_fuzzing = False
            cont = input('Restart the server then hit enter to continue.')
    
    print('Checking connection')
    s,connection = connection_init()
    test = input('Send test command: ')
    send_message(s, test)
    print(s.recv(1024).decode())

    while fine_fuzzing:
        try:
            payload = ''.join([command, ' ', buffer])
            print(len(buffer))
            s,connection = connection_init()
            send_message(s, payload)
            buffer = buffer + 'A'
            sleep(2)
        except:
            print('The buffer size is %d' % (len(buffer)-2))
            fine_fuzzing = False
    return buffer



def auto():
    return


if __name__ == '__main__':
    s,connection = connection_init()

    while connection:
        message = input('-> ')
        print(message)
        if message == 'tools':
            overflow_tools()
            connection_init()
        else:
            send_message(s, message)
            print(s.recv(1024).decode())
    
    s.close()


