#!/bin/bash
import sys
import socket
from datetime import datetime


#Filtering and processing arguments 
if len(sys.argv) == 2:
    target = socket.gethostbyname(sys.argv[1])
else:
    Print("Invalid amount of arguments.")
    Print("Syntax: python3 scanner.py <IP>")

#Adding banner
print("_" * 50)
print(f"Scanning target: {target}")
print("Time started: {}".format(str(datetime.now())))


try:
    for port in range(50,85):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        socket.setdefaulttimeout(1)
        result = s.connect_ex((target, port))

        if result == 0:
            print(f"Port {port} is open")
except KeyboardInterrupt:
    print("\nExiting program.")
    sys.exit()
except socket.gaierror:
    print("Hostname could not be resolved.")
    sys.exit()
except socket.error:
    print("Could not connect to server.")

