'use strict'

const Net = require('net');

const PORT = 3456;

let inSockets = {};
let outSockets = {};

Net.createServer((socket) => {
  const host = socket.remoteAddress.replace('::ffff:', '');
  const id = `${host}:${PORT}`;

  inSockets[id] = socket;
  outSockets[id] = Net.createConnection(PORT, host, () => {
    console.log(id);
  });

  socket.on('data', (data) => {
    for (let sid in outSockets) {
      if (sid !== id) {
        outSockets[sid].write(data);
      }
    }
  });
}).listen(PORT);