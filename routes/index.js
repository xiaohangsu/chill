const CONFIG       = require('process').argv[2];
const Router       = require('koa-router');
const send         = require('koa-send');
const fs           = require('fs');
const util         = require('util');
const rooms        = require('../data/room');

let router         = new Router();

let STATIC_PATH = '';
if (CONFIG === 'dev') {
    STATIC_PATH = 'http://localhost:8080/';
} else if (CONFIG === 'dist') {
    STATIC_PATH = '/dist/';
}

router.get('/', (ctx, next)=> {
    return ctx.render('../views/index.html', {
        staticPath: STATIC_PATH
    });
});

let START_TIME = 0;
router.get('/*.mp4', (ctx, next)=> {
    const ip = ctx.request.ip.replace('::ffff:', '');
    console.log('GET | /*.mp4 ', ip);
    rooms.startVideo(ip);
    if (START_TIME === 0) START_TIME = (new Date()).getTime();
    console.log(__dirname + '/../public' + ctx.req.url);
    let path = __dirname + '/../public' + ctx.req.url;
    let stat = fs.statSync(path);
    let total= stat.size;
    let start, end;
    if (ctx.req.headers.range){
        let range = ctx.req.headers.range;
        let parts = range.replace(/bytes=/, '').split('-');
        start = parts[0];
        end   = parts[1];
        start = parseInt(start);
        end   = end ? parseInt(end) : total - 1;
        var chunksize = (end - start) + 1;
        console.log('Video Range: ' + start + ' - ' + end + ' = ' + chunksize);
        let file = fs.createReadStream(path, {start: start, end: end});
        ctx.res.writeHead(206, {
            'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'});
        ctx.body = file.pipe(ctx.res);
    } else {
        console.log('All Video File: ' + total);
        ctx.res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
        ctx.body = fs.createReadStream(path).pipe(ctx.res);
    }
});

router.get('/offset', (ctx, next)=>{
    const ip = ctx.request.ip.replace('::ffff:', '');
    console.log('GET | /offset ', ip);
    ctx.body = {
        startTime: rooms.getStartTime(ip) | 0
    };
});

router.post('/createRoom', (ctx, next)=>{
    const ip = ctx.request.ip.replace('::ffff:', '');
    console.log('POST | /createRoom ', ip, JSON.parse(ctx.request.body.isPrivate));
    ctx.body = rooms.createRoom(ip, JSON.parse(ctx.request.body.isPrivate));
});

router.post('/joinRoom', (ctx, next)=> {
    const ip = ctx.request.ip.replace('::ffff:', '');
    console.log('POST | /joinRoom ', ip);
    const roomName = ctx.request.body.roomName;
    ctx.body = rooms.joinRoom(ip, roomName);
});

router.get('/getRoomsInfo', (ctx, next)=> {
    const ip = ctx.request.ip.replace('::ffff:', '');
    ctx.body = rooms.getRoomsInfo(ip);
});

router.get('/leaveRoom',(ctx, next)=> {
    const ip = ctx.request.ip.replace('::ffff:', '');
    rooms.leaveRoom(ip);
    ctx.body = '';
});

module.exports = router;