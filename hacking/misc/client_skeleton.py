import socket
import subprocess
  
  
def run_command(command):
    result = subprocess.check_output(command, shell=True)
    return result
  
  
def client_conn():
    host = socket.gethostname()
    port = 3684
    
    data = ''
    
    client_socket = socket.socket()
    client_socket.connect((host, port))
    
    message = input(" -> ")
    while data.lower().strip() != 'close':
        client_socket.send(message.encode())
        data = client_socket.recv(1024).decode()
    
        print('Received from server: %s' % str(data))
    
        if (data == 'command'):
            print('waiting for command from server')
            server_command = ''
            end = False
    
            while not end:
                server_command = client_socket.recv(1024).decode()
            
                if not server_command:
                    break
                else:
                    end = True
        
            result = run_command(server_command)
            client_socket.send(result)
    
        message = input(" -> ")
    
#        client_socket.close()

    
if __name__ == '__main__':
    client_conn()