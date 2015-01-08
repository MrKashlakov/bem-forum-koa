var koa = require('koa');
var bodyParser = require('koa-bodyparser');
var session = require('koa-generic-session');
var mount = require('koa-mount');
var _ = require('underscore');
var serveStatic = require('koa-static');

var forumMiddleware = require('./middleware/forum');
var template = require('./middleware/bem');
var config = require('./config').get('forum');
var locale = require('./middleware/locale');
var init = require('./middleware/init');

var app = koa();

app.use(serveStatic(process.cwd()));

app.use(bodyParser());

app.keys = ['bem', 'forum', 'koa'];

app.use(session());

app.use(locale(config.defaultLanguage));
app.use(init(config));

app.use(function* (next) {
	//console.log(this.request.host);
	return yield next;
});

app.use(mount(config.forumUrl, forumMiddleware(config)));
app.use(template);

app.listen(config.port, function () {
	console.log('Server started on port ' + config.port);
});