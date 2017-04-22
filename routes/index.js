const CONFIG       = require('process').argv[2];
const Router       = require('koa-router');
const send         = require('koa-send');
const fs           = require('fs');
const util         = require('util');

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

let start = 0;
router.get('/*.mp4', (ctx, next)=> {
    if (start === 0) start = (new Date()).getTime();
        return send(ctx, '/public/movie.mp4');
});

router.get('/offset', (ctx, next)=>{
    ctx.body = {
        offset: (new Date()).getTime() - start
    };
});

module.exports = router;