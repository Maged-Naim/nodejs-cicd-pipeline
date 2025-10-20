const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js CI/CD Pipeline!');
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});

