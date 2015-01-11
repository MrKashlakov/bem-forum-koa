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

var DataAccessLayer = function (options, token) {
	this.options = options;
	this.token = token;

	this._githubApi = new GithubApiController(options);
	if (token) {
		this._githubApi.addUserAPI(token);
	} else {
		this._githubApi.addDefaultAPI();
	}
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
	var result = yield this._githubApi.getIssues
	({
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

	var issues = yield this._loadAllIssues(this.token);


	var filterLabels = options.labels;
	var filterSince = options.since; 

	// filter by labels
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

	// filter by updated date
	if (filterSince && _.isDate(filterSince)) {
		issues = issues.filter(function (issue) {
			return new Date(issue.created_at).getTime() >= filterSince.getTime();
		});
	}


	//sort
	var sortField = (options.sort && /^(created|updated|comments)$/.test(options.sort)) 
		? options.sort : DEFAULT_PARAMS.sort.field;
	var sortDirection = (options.direction && /^(asc|desc)$/.test(options.direction))
		? options.direction : DEFAULT_PARAMS.sort.direction;

	var order = DEFAULT_PARAMS.sort.direction === sortDirection ? -1 : 1;

	issues = issues.sort(function (a, b) {
		var aNumber = +a.number;
		var bNumber = +b.number;

		if (aNumber * bNumber < 0) {
			return aNumber - bNumber;
		}

		if (sortField === 'comments') {
			return order * (+a[sortField] - +b[sortField]);
		}

		return order * ((new Date(a[sortField + '_at'])).getTime() - 
			(new Date(b[sortField + '_at'])).getTime());
	});


	var page = options.page || DEFAULT_PARAMS.page;
	var limit = options.per_page || DEFAULT_PARAMS.perPage;

	var issues = issues.filter(function (issue, index) {
		return index >= limit * (page - 1) && index < limit * page;
	});

	return issues;
};

DataAccessLayer.prototype.getAuthUser = function* (options) {
	options = options || {};
	_.extend(options, {token: this.token});

	return yield this._githubApi.getAuthUser(options);
}

DataAccessLayer.prototype.getLabels = function* (options) {
	options = options || {};
	_.extend(options, {token: this.token});
	//TODO: Add caching
	return yield this._githubApi.getLabels(options);
}


module.exports = DataAccessLayer;