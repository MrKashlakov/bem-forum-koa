var co = require('co');
var should = require('should');
var GithubApiController = require('../../../middleware/github');

var token = 'e7087e1f80907aba33273a5ef6a3431d0eeaa3c8';

describe('Githu API test', function () {
	it ('Create issue', function (done) {
		this.timeout(5000)
		co(function* () {
			var githubApi = new GithubApiController();
			yield githubApi.addUserAPI(token);

			var settings = {
				token: token,
				options: {
					title: 'Test issue',
					body: 'This is test issue',
					state: 'open',
					storage: {
						user: 'MrKashlakov',
						repo: 'bem-forum-koa'
					},
					labels: []
				}
			};

			var response = yield githubApi.createIssue(settings);
			(response).should.be.ok;
			done();
		}).catch(function (err) {
			done(err);
		});
	});
});