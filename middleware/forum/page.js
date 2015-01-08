var _ = require('underscore');
var bem = require('../bem');
var GithubApiController = require('../github');
var DataAccessLayer = require('../data-access-layer');

module.exports = function (options) {
	return function* (next) {
	
		var token = this.cookies.get('forum_token');

		if (token) {

			_.extend(options, {
				token: token
			});

			var githubApi = new GithubApiController(options);
			var dataAccess = new DataAccessLayer(options);

			githubApi.addUserAPI(token);
			var user = yield githubApi.getAuthUser({
				token: token
			});

			var labels = yield githubApi.getLabels({
				token: token
			});

			var issues = yield dataAccess.getIssues({token: token});

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
		}

		return yield next;
	}
};