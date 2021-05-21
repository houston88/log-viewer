const express    = require('express');
const http       = require('http');
const { Server } = require("socket.io");
var { spawn }    = require('child_process');
const { Tail }   = require('tail');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// use file argument passed in
const filename = process.argv[2];
if (!filename) {
  console.log("Usage: node index.js filename_to_tail");
  return;
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/lib/jquery.min.js', (req, res) => {
  console.log('Return jquery...');
  res.sendFile(__dirname + '/lib/jquery-3.6.0.slim.min.js')
});
app.get('/lib/socket.io.min.js', (req, res) => {
  console.log('Return socket.io...');
  res.sendFile(__dirname + '/lib/socket.io.min.js')
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // let's see if we can tail something...
  socket.send({ filename: filename });
  
  // can we just tail inline, or does it block?
  tail = new Tail(filename, {
    separator: null,
    nLines: 20,
    flushAtEOF: true
  });
  tail.on('line', data => {
    console.log(data.toString('utf-8'));
    socket.send({ tail: data.toString('utf-8') });
  });

  // Using standard tail... works too
  //var tail = spawn('tail', ['-n', 0, '-f', filename]);
  //tail.stdout.on('data', (data) => {
  //  console.log(data.toString('utf-8'));
  //  socket.send({ tail: data.toString('utf-8') });
  //});

  socket.on('message', (msg) => {
    console.log('Time for some other action!?');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});