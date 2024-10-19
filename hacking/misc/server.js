// ChatGPT exploit server for testing bug bounty stuff
// pairs with the index.html file in the same directory
// basically a similar functionality to the burp exploit server 
// I plan to add onto it later and probably host my own instance for BB use
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Array to store access logs
let accessLogs = [];

// Serve static files
const serveFile = (res, filePath) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error loading file');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    });
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Serve payload creation page
    if (pathname === '/') {
        serveFile(res, path.join(__dirname, 'index.html'));
    }

    else if (pathname === '/logs') {
        // Log the visit to the /logs page
        accessLogs.push({
            timestamp: new Date(),
            url: '/logs',
            method: 'GET',
            data: null
        });
    
        // Generate the HTML for logs with the same style as the main page
        let logHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>TheTrashCan - Access Logs</title>
                <style>
                    body {
                        background-color: #1e1e1e;
                        color: #cfcfcf;
                        font-family: 'Roboto', sans-serif;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-image: url('https://your-dumpster-raccoon-image-url'); /* Replace with a suitable image */
                        background-size: cover;
                        background-blend-mode: multiply;
                    }
    
                    h1 {
                        font-family: 'Roboto Condensed', sans-serif;
                        text-align: center;
                        color: #d0d0d0;
                        text-shadow: 1px 1px 5px #000;
                        letter-spacing: 1px;
                    }
    
                    .container {
                        width: 600px;
                        background-color: rgba(30, 30, 30, 0.9);
                        padding: 20px;
                        border-radius: 15px;
                        box-shadow: 0px 0px 20px 2px #000;
                    }
    
                    ul {
                        list-style-type: none;
                        padding-left: 0;
                    }
    
                    li {
                        background-color: #2a2a2a;
                        margin-bottom: 10px;
                        padding: 10px;
                        border-radius: 5px;
                        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.6);
                    }
    
                    a {
                        color: #909090;
                        text-decoration: none;
                        display: block;
                        text-align: center;
                        margin-top: 20px;
                    }
    
                    a:hover {
                        text-decoration: underline;
                    }
    
                    button {
                        background-color: #6e6e6e;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        font-size: 16px;
                        cursor: pointer;
                        box-shadow: 2px 2px 10px #000000;
                        display: inline-block;
                        margin-top: 20px;
                    }
    
                    button:hover {
                        background-color: #909090;
                    }
                </style>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Roboto+Condensed:wght@700&family=Roboto+Mono&display=swap" rel="stylesheet">
            </head>
            <body>
                <div class="container">
                    <h1>Access Logs</h1>
                    <ul>
        `;
    
        // Add each log entry to the HTML
        accessLogs.forEach((log, index) => {
            logHTML += `<li>${index + 1}: ${log.timestamp} - <strong>${log.url}</strong> - ${log.method}`;
    
            // If there's exfiltrated data, display it
            if (log.data) {
                logHTML += `<br><em>Exfiltrated Data:</em> ${JSON.stringify(log.data)}`;
            }
    
            logHTML += '</li>';
        });
    
        logHTML += `
                    </ul>
                    <a href="/">Back to TheTrashCan</a>
                </div>
            </body>
            </html>
        `;
    
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(logHTML);
    }
    
    
    // Save payload request
    else if (pathname.startsWith('/save-payload')) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { payload, endpoint } = JSON.parse(body);
            const savePath = path.join(__dirname, 'payloads', endpoint + '.html');

            // Save payload to file
            fs.writeFile(savePath, payload, (err) => {
                if (err) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ success: false, message: 'Error saving payload' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, url: `/payloads/${endpoint}.html` }));
                }
            });
        });
    }

    // Serve dynamically created payloads and log access
    else if (pathname.startsWith('/payloads/')) {
        const filePath = path.join(__dirname, pathname);
        serveFile(res, filePath);

        // Log the access
        accessLogs.push({
            timestamp: new Date().toISOString(),
            url: pathname,
            method: req.method,
        });
    }

    // Exfiltration endpoint: handle data exfiltration
    else if (pathname === '/exfiltrate') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const exfilData = JSON.parse(body);

            // Log exfiltrated data
            accessLogs.push({
                timestamp: new Date().toISOString(),
                url: '/exfiltrate',
                method: req.method,
                data: exfilData,
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Data exfiltrated' }));
        });
    }

    // Serve 404 for any other routes
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(8000, () => {
    console.log('Server running on port 8000');
});
