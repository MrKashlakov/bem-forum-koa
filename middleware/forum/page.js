var _ = require('underscore');
var bem = require('../bem');
var GithubApiController = require('../github');
var DataAccessLayer = require('../data-access-layer');

module.exports = function (options) {
	return function* (next) {
	
		var token = this.cookies.get('forum_token');

		var dataAccess = new DataAccessLayer(options, token);

		var user = yield dataAccess.getAuthUser();
		var labels = yield dataAccess.getLabels();
		var issues = yield dataAccess.getIssues();

		var forum = {
			user: user,
			labels: labels,
			issues: issues,
			view: 'issues',
			global: {
				debug: true
			}
		};

		_.extend(this.viewBag.__data, {
			forum: forum
		});

		return yield next;
	}
};