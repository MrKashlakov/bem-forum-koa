var _ = require('underscore');
var Router = require('koa-router');
var csrf = require('koa-csrf');

var IssueViewController = require('./issues');
var CommentViewController = require('./comments');
var LabelViewController = require('./labels');
var UserViewController = require('./users');
var AuthViewController = require('./auth');
var RepoViewController = require('./repo');
var InitController = require('./init');

/**
 * Create forum middleware
 * @return {Generator}
 */
module.exports = function (options, app) {

	var router = new Router();

	var commonSettings = {
		router: router
	};

	options = _.extend(options, commonSettings);

	var issues = new IssueViewController(options);
	_.extend(router, issues.getRouter());
	var comments = new CommentViewController(options);
	_.extend(router, comments.getRouter());
	var labels = new LabelViewController(options);
	_.extend(router, labels.getRouter());
	var users = new UserViewController(options);
	_.extend(router, users.getRouter());
	var auth = new AuthViewController(options);
	_.extend(router, auth.getRouter());
	var repo = new RepoViewController(options);
	_.extend(router, repo.getRouter());

	var initScript = new InitController(options);

	app.use(function* (next) {
		var staticData = yield* initScript.initStaticData({
			requestType: this.request.get('X-Requested-With'),
			loadSettings: {
				session: this.session,
				token: this.cookies.get('forum_token')
			},
			csrf: this.csrf
		});
		this.request.isXhr = staticData.request.isXhr;
		this.viewBag = staticData.viewBag;
		this.session.user = staticData.session.user;
		this.session.labels = staticData.session.labels;
		this.lang = staticData.lang;
		return yield* next;
	});

	csrf(app);

	app.use(function* (next) {
		try {
			if (this.request.method === 'POST') {
				this.assertCSRF(this.request.body);
			}
			return yield* next;
		} catch (err) {
			this.status = 403;
			this.body = {
				message: 'CSRF token is invalid'
			}
		}
	});

	return router.middleware();

};