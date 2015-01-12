var _ = require('underscore');
var Router = require('koa-router');

var IssueViewController = require('./issues');
var CommentViewController = require('./comments');
var LabelViewController = require('./labels');
var UserViewController = require('./users');
var AuthViewController = require('./auth');
var RepoViewController = require('./repo');

/**
 * Create forum middleware
 * @return {Generator}
 */
module.exports = function (options) {

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

	return router.middleware();

};