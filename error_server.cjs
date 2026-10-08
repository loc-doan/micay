const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.url.startsWith('/log?err=')) {
    const err = decodeURIComponent(req.url.substring(9));
    fs.writeFileSync('error_dump.txt', err);
    console.log('Received error!');
    res.end('OK');
  } else {
    res.end('Not found');
  }
}).listen(8080, () => {
  console.log('Error logger listening on 8080');
});
