var _ = require('underscore');
var thunkify = require('thunkify');
var GithubApi = require('github');


var API_CONFIG = {
	version: '3.0.0',
	protocol: 'https',
	timeout: 10000,
	debug: false,
	host: 'api.github.com'
}

var GithubApiController = function (options) {
	this.options = options || {};
	this._apiHash = {};
};

GithubApiController.prototype.getUserAPI = function* (token) {
	return this._apiHash[token];
};

GithubApiController.prototype.getDefaultAPI = function* () {
	var tokens = this.options.auth ? this.options.auth.tokens : [];
	return this._apiHash[_.sample(tokens)];
}

GithubApiController.prototype.addDefaultAPI = function () {
	var tokens = this.options.auth ? this.options.auth.tokens : [];
	this._apiHash = tokens.reduce(function (prev, token) {
		var githubApi = new GithubApi(API_CONFIG);
		githubApi.authenticate({
			type: 'oauth',
			token: token
		});

		prev[token] = githubApi;
		return prev;
	}, {});
};

GithubApiController.prototype.addUserAPI = function (token) {
	if (!this._apiHash[token]) {
		var githubApi = new GithubApi(API_CONFIG);
		githubApi.authenticate({
			type: 'oauth',
			token: token
		});

		this._apiHash[token] = githubApi;
	}
};

GithubApiController.prototype._apiCall = function* (settings) {
	settings = settings || {};
	var options = settings.options || {};

	var api = settings.token ? yield this.getUserAPI(settings.token) : yield this.getDefaultAPI();
	options = _.extend({}, this.options.storage, options);

	if (!api) {
		console.log('API EMPTY');
		return undefined;
	}

	console.log('API CALL: ', settings.token, settings.group, settings.name, options);

	return yield thunkify(api[settings.group][settings.name]).call(null, options);
};


GithubApiController.prototype._getFnName = function (fn) {
	var _this = this;
	return Object.keys(this).filter(function (key) {
		return _this[key] === fn;
	})[0];
};


GithubApiController.prototype.getIssues = function* (settings) {
	_.extend(settings, {
		group: 'issues',
		name: 'repoIssues'
	});
	_.extend(settings.options, {
		state: 'all',
		sort: 'updated'
	});

	return yield this._apiCall(settings);
};

GithubApiController.prototype.getIssue = function* (settings) {
	_.extend(settings, {
		group: 'issues',
		name: 'getRepoIssue'
	});

	return yield this._apiCall(settings);
};

GithubApiController.prototype.createIssue = function* (settings) {
	_.extend(settings, {
		group: 'issues',
		name: 'create'
	});

	return yield this._apiCall(settings);
};

GithubApiController.prototype.editIssue = function* (settings) {
	_.extend(settings, {
		group: 'issues',
		name: 'edit'
	});

	return yield this._apiCall(settings);
};


GithubApiController.prototype.getComments = function* (settings) {
	_.extend(settings, {
		group: 'issues',
		name: this._getFnName(arguments.callee)
	});

	return yield this._apiCall(settings);
};

GithubApiController.prototype.createComment = function* (settings) {
	_.extend(settings, {
		group: 'issues',
		name: this._getFnName(arguments.callee)
	});

	return yield this._apiCall(settings);
};

GithubApiController.prototype.deleteComment = function* (settings) {
	_.extend(settings, {
		group: 'issues',
		name: this._getFnName(arguments.callee)
	});

	return yield this._apiCall(settings);
};

GithubApiController.prototype.editComment = function* (settings) {
	_.extend(settings, {
		group: 'issues',
		name: this._getFnName(arguments.callee)
	});

	return yield this._apiCall(settings);
};


GithubApiController.prototype.getLabels = function* (settings) {
	_.extend(settings, {
		group: 'issues',
		name: 'getLabels'
	});

	return yield this._apiCall(settings);
};

GithubApiController.prototype.getAuthUser = function* (settings) {
	_.extend(settings, {
		group: 'user',
		name: 'get'
	});

	return yield this._apiCall(settings);
};

GithubApiController.prototype.getRepoInfo = function* (settings) {
	_.extend(settings, {
		group: 'repos',
		name: 'get'
	});

	return yield this._apiCall(settings);
};


module.exports = GithubApiController;