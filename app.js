const Koa   = require('koa');
const views = require('koa-views');
const send  = require('koa-send');
const app   = new Koa();
const bodyParser = require('koa-bodyparser');
const index = require('./routes/index');

app
    .use(views(__dirname + '/views', {
        map: {
            html: 'ejs'
        }
    }))
    .use(bodyParser())
    .use(index.routes())
    .use(index.allowedMethods());

app.listen(5000);