var vow = require('vow');
var co = require('co');
var _ = require('underscore');
var GithubApiController = require('../github');


var DEFAULT_PARAMS = {
	page: 1,
	perPage: 100,
	limit:10,
	sort: {
		field: 'updated',
		direction: 'desc'
	}
};

var DataAccessLayer = function (options) {
	this.options = options;
	this._githubApi = new GithubApiController(options);
	console.log(options.token);
	this._githubApi.addUserAPI(options.token);
};

DataAccessLayer.prototype._loadAllIssues = function* (token) {
	var issues = [];
	var page = DEFAULT_PARAMS.page;
	
	issues = yield this._fetchIssues({
		issues: issues,
		page: page,
		token: token
	});
	
	return issues;
}

DataAccessLayer.prototype._fetchIssues = function* (options) {
	var result = yield this._githubApi.getIssues({
		token: options.token,
		page: options.page,
		per_page: DEFAULT_PARAMS.perPage
	});

	++options.page;
	options.issues = options.issues.concat(result);

	if (DEFAULT_PARAMS.perPage === options.issues.length) {
		yield this._fetchIssues(options);
	}

	return options.issues;
};


DataAccessLayer.prototype.getIssues = function* (options) {
	options = options || {};

	var issues = yield this._loadAllIssues(options.token);

	var filterLabels = options.labels;
	var filterSince = options.since; 

	if (filterLabels) {
		filterLabels = filterLabels.split(',');
		issues = issues.filter(function (issue) {
			var issueLabels = issue.labels.map(function (label) {
				return label.name || label;
			});
			return filterLabels.every(function (filterLabel) {
				return issueLabels.indexOf(filterLabel) > -1;
			});
		});
	}

	if (filterSince && _.isDate(filterSince)) {
		issues = issues.filter(function (issue) {
			return new Date(issue.created_at).getTime() >= filterSince.getTime();
		});
	}

	var page = options.page || DEFAULT_PARAMS.page;
	var limit = options.per_page || DEFAULT_PARAMS.perPage;

	var issues = issues.filter(function (issue, index) {
		return index >= limit * (page - 1) && index < limit * page;
	});

	return issues;
};


module.exports = DataAccessLayer;