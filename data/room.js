const Net = require('net');
const PORT= 3000;
class Rooms {
    constructor() {
        this.ips    = {}; // map ip to roomName
        this.ports  = {}; // map ip to port
        this.sockets= {}; // map ip to socket
        this.rooms  = {}; // map roomName to ips Array
        this.isPrivate = {};
        this.startTime = {};
        this.counter = 0;
        this.portCounter = 3001;
    }

    createRoom(ip, isPrivate=false, isFalseData=false) {
        let roomName = (new Date()).getTime() % 10000;
        while (this.rooms[roomName] != undefined) {
            roomName = (new Date()).getTime() % 10000;
        }
        this.ips[ip] = roomName;
        this.rooms[roomName] = [];
        this.rooms[roomName].push(ip);
        this.ports[ip] = this.portCounter++;
        if (isPrivate) this.isPrivate[roomName] = true;
        else this.isPrivate[roomName] = false;
        console.log(this.isPrivate[roomName]);
        if (!isFalseData)
            setTimeout(()=>{
                this.createSocket(ip, PORT);
            }, 1000);
        return {
            roomName: roomName,
            port: this.ports[ip]
        };
    }

    joinRoom(ip, roomName) {
        console.log(ip, ' join room ', roomName);
        roomName = parseInt(roomName);
        this.ips[ip] = roomName;
        this.rooms[roomName].push(ip);
        this.ports[ip] = this.portCounter++;
        setTimeout(()=>{
            this.createSocket(ip, PORT, ()=>{
                this.boardcast(ip, 'join');
            });
        }, 1000);
        return {
            port: this.ports[ip],
            peers: this.rooms[roomName].filter((IP)=>{
                return IP != ip;
            }).map((IP)=>{
                return `${IP}:${this.ports[IP]}`
            })
        };
    }

    leaveRoom(ip) {
        console.log(ip, ' leave room.');
        const roomName = this.ips[ip];
        let room = this.rooms[this.ips[ip]];
        this.boardcast(ip, 'leave');
        for (let i in room) {
            if (ip == room[i]) room.splice(i, 1);
        }
        console.log(ip, this.rooms[this.ips[ip]]);
        if (this.rooms[this.ips[ip]] && this.isPrivate[roomName])
            delete this.isPrivate[roomName];
        if (this.rooms[this.ips[ip]] && this.rooms[this.ips[ip]].length == 0)
            delete this.rooms[this.ips[ip]];
        delete this.sockets[ip];
        delete this.ports[ip];
        delete this.ips[ip];
    }

    returnRoomMemebers(rooms) {
        return this.ips;
    }

    // this is setting video start time
    startVideo(ip) {
        if (this.startTime[this.ips[ip]] === undefined) {
            console.log('Start Video, trigger by ', ip);
            this.startTime[this.ips[ip]] = (new Date()).getTime() / 1000;
        }
    }

    getStartTime(ip) {
        console.log(ip, ' get StartTime ', this.startTime[this.ips[ip]])
        return this.startTime[this.ips[ip]];
    }

    getRoomsInfo(ip) {
        console.log(ip, ' Get Room Info.');
        let infos = [];
        for (let i in this.rooms) {
            console.log(this.rooms[i], i, this.isPrivate[i]);
            if (!this.isPrivate[i]) {
                infos.push({
                    usersCount: this.rooms[i].length,
                    videoName: 'movie.mp4',
                    roomName: i
                });
            }
        }
        return {
            infos: infos
        };
    }


    createSocket(ip, port, cb=()=>{}) {
        if (this.sockets[ip] === undefined) {
            this.sockets[ip] = Net.createConnection(port, ip, ()=> {
                console.log('Room::CreateSocket Connected to ', ip + ':' + port);
                cb();
            });
            this.sockets[ip].on('error', (err)=>{
                console.log('Room::CreateSocket ', ip, ' Error: ', err.message);
                this.leaveRoom(ip);
            });
            this.sockets[ip].on('close', ()=>{
                console.log('Room::CreateSocket ', ip, ' Closed Socket with Server.');
                this.leaveRoom(ip);
            });
        } else {
            console.log('Room::CreateSocket ', ip, ' already has a socket, not need to create');
        }
    }

    boardcast(ip, message) {
        if (this.sockets[ip] === undefined)
            console.error('Room::boardcast Not this socket in rooms: ip', ip);
        else {
            const room = this.rooms[this.ips[ip]]; // add ip in this room
            console.log('Room::boardcast boradcast in Room ',
                this.ips[ip], ': ', ip, ' message: ', message);
            for (let i in room) {
                if (room[i] != ip && this.sockets[room[i]]) {
                    console.log('Room::boardcast boradcast in Room ',
                        room, ': to ', room[i], `{ip: ${ip}, port:${this.ports[ip]}, message:${message}}`);
                    this.sockets[room[i]].write(`{ip: ${ip}, port:${this.ports[ip]}, message:${message}}\n`);
                }
            }
        }
    }
}

const rooms = new Rooms();

module.exports = rooms;