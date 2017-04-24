'use strict'

const Net  = require('net');
const room = require('../data/room');
const PORT = 3456;

Net.createServer((socket)=> {
    const host = socket.remoteAddress.replace('::ffff:', '');
    const ip   = `${host}`;
    console.log(ip, ' Connect to socket');
    room.createSocket(ip, PORT);
    socket.on('data', (data)=>{
        room.boardcast(ip, data);
    });
}).listen(PORT);