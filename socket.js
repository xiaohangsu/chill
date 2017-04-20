'use strict';
const Net    = require('net');
const Duplex = require('stream').Duplex;

const kSource= Symbol('source');
const HOST   = '172.16.22.3';
const TOPIC  = 'chill';
const PORT   = 6969;
let len = 0;

const Kafka  = require('node-rdkafka');

const PRODUCER_CONFIG = {
    'metadata.broker.list': '34.208.177.202:9092'
};

const CONSUMER_CONFIG = {
    'group.id': '0',
    'metadata.broker.list': '34.208.177.202:9092'
};

class TCPConnection {
    constructor(){
        this.connection = {};
        this.consumer   = {};
    }

    addConnection(host, port){
        let id = host+ ':' + port;
        this.connection[id] = Net.createConnection(port, host, ()=>{
            console.log('Connection with: ', id);
        });
        this.connection[id].on('error', (err)=>{
            console.log('Error Nodejs to Phone Socket ', id, err);
        });
        this.connection[id].on('connect', ()=>{
            console.log('Connected Nodejs to Phone Socket ', id);
        });
        this.connection[id].on('close', ()=>{
            console.log('Close Nodejs to Phone Socket ', id)
        });

        this.consumer[id] = new Kafka.KafkaConsumer(CONSUMER_CONFIG).getReadStream(TOPIC);
        this.consumer[id].on('data', (data)=>{
            console.log(data);
            this.connection[id].write(data.value);
        });
    }
};

class Producer {
    constructor() {
        this.producer = {};
    }

    addProducer(host, port) {
        let id = host + ':' + port;
        this.producer[id] = new Kafka.Producer(PRODUCER_CONFIG).getWriteStream(TOPIC);
        this.producer[id].on('error', (err)=>{
            console.error('Error in producer to kafka stream');
            console.error(err);
        });
    }

    send(host, port, data) {
        let id = host + ':' + port;
        if (this.producer[id] == undefined) this.addProducer(host, port);
        let queueSuccess = this.producer[id].write(data);
        if (!queueSuccess) {
            console.log('Too many message');
        }
    }
}


const connections = new TCPConnection();
const producers  = new Producer();
Net.createServer((sock)=>{
    let host = sock.remoteAddress.replace('::ffff:', '');
    let port = sock.remotePort;
    console.log('CONNECTED Phone to Nodejs Socket: ', host, PORT);
    connections.addConnection(host, PORT);
    sock.on('data', (data)=> {
        len += data.length;
        producers.send(host, PORT, data);
    });
    sock.on('error', (err)=> {
        console.log('Error', err);
    });
}).listen(PORT);

setInterval(()=>{
    console.log(len, (len / 1024) + '/KB');
    len = 0;
}, 1000);

console.log('SERVER listening on ' + PORT);