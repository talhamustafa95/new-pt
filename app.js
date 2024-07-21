const express = require('express');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3000;
const app = express();
const spdy = require('spdy');

// app.use(express.static('public'));


const sslKeyPath = path.join(__dirname, 'server.key');
const sslCertPath = path.join(__dirname, 'server.cert');

// Function to check SSL configuration
function checkSSLConfig() {
    try {
        // Read the SSL certificate and key files
        const key = fs.readFileSync(sslKeyPath);
        const cert = fs.readFileSync(sslCertPath);

        // Log success if files are read correctly
        console.log('SSL Certificate and Key successfully loaded.');
        return {
            key,
            cert
        };
    } catch (error) {
        // Log error if files are not read correctly
        console.error('Error loading SSL Certificate or Key:', error);
        process.exit(1); // Exit the process if SSL configuration is incorrect
    }
}

// SSL options
const sslOptions = checkSSLConfig();

// CORS Middleware
app.use((req, res, next) => {
    console.log('CORS Middleware triggered');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Web-User-Auth');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        console.log('Preflight request detected, sending 200 response');
        return res.status(200).json({});
    }
    next();
});

// Serve static HTML file
app.get('/', (req, res) => {
    console.log('GET / request received');
    const filePath = path.join(__dirname, 'public', 'index.html');
    console.log(`Serving file: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('File sent successfully');
        }
    });
});

app.get('/api', (req, res) => {
    console.log('GET /api request received');
    res.json({
        message: 'This is your API response from HTTP/2'
    });
});


const server = spdy
    .createServer(sslOptions, app)
    .listen(port, (error) => {
        if (error) {
            console.error(error)
            return process.exit(1)
        } else {
            console.log('Listening on port: ' + port + '.')
        }
    })

// Error handling
server.on('error', (err) => {
    console.error('Server error:', err);
});