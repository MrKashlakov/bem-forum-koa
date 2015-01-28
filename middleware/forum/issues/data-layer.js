var _ = require('underscore');
var cache = require('memory-cache');

var GithubApiController = require('../github');

/**
 * Default params for issues filter
 * @type {Object}
 */
var DEFAULT_PARAMS = {
	page: 1,
	perPage: 10,
	limit:10,
	sort: {
		field: 'updated',
		direction: 'desc'
	}
};

/**
 * Caching time in miliseconds
 * @type {Number}
 */
var POOLING_INTERVAL = 10000; 

/**
 * Constructor for issues data controller
 * @param {Object} options application settings
 */
var IssuesDataController = function (options) {
	this.options = options || {};
	this._githubApi = new GithubApiController(options);
};

/**
 * Set auth token to API
 * @param {String} token auth token
 */
IssuesDataController.prototype.setToken = function (token) {
	if (token) {
		this.token = token;
		this._githubApi.addUserAPI(token);
	} else {
		delete this.token;
		this._githubApi.addDefaultAPI();
	}
};

/**
 * Load all github issues
 * @private
 */
IssuesDataController.prototype._loadAllIssues = function* () {
	var issues = [];
	var page = DEFAULT_PARAMS.page;
	
	issues = yield* this._fetchIssues({
		issues: issues,
		page: page
	});
	
	return issues;
}

/**
 * Fetch github issues by page
 * @param {Object} options github setting
 * @private
 */
IssuesDataController.prototype._fetchIssues = function* (options) {
	var result = yield* this._githubApi.getIssues
	({
		token: this.token,
		page: options.page,
		per_page: DEFAULT_PARAMS.perPage
	});

	++options.page;
	options.issues = options.issues.concat(result);

	if (DEFAULT_PARAMS.perPage === options.issues.length) {
		yield this._fetchIssues(options);
	}

	options.issues = options.issues.filter(function (issue) {
		var labels = issue.labels;
		return labels.length ? labels.every(function (label) {
			return label.name !== 'removed';
		}) : true;
	});

	return options.issues;
};

/**
 * Filter all github issues
 * @param {Object} options filter settings
 * @private
 */
IssuesDataController.prototype._getIssues = function* (options) {
	options = options || {};

	var issues = cache.get('issues');
	if (!issues) {
		var issues = yield* this._loadAllIssues(this.token);
		cache.del('issues');
		cache.put('issues', issues, POOLING_INTERVAL);
	}
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

/**
 * Get all github issues
 * @param {Object} options filter and github settings
 * @param {String} [options.state] state of issue (open, close)
 * @param {String} [options.label] string of labels separated by comma
 * @param {String} [options.sort] sort criteria (created, updated, comments)
 * @param {String} [options.direction] sort direction (asc, desc)
 * @param {Date} [options.since] date from
 * @param {Number} [options.page] number of page for pagination
 * @param {Number} [options.per_page] number of issues per one page
 * @returns {Array} array of issues
 */
IssuesDataController.prototype.getIssues = function* (options) {
	return yield* this._getIssues(options);
};

/**
 * Get issue by number
 * @param {Number} number number of issue
 * @returns {Object}
 */
IssuesDataController.prototype.getIssue = function* (number) {
	if (number && number > 0) {
		var issues = yield* this.getIssues();
		return issues.filter(function (issue) {
			return issue.number.toString() === number.toString();
		})[0];
	} else {
		return null;
	}
};

/**
 * Create new issue
 * @param {Object} options creation options
 * @param {String} [options.title] title of issue
 * @param {String} [options.body] body of issue
 * @param {Array} labels names (required)
 * @returns {Object} new issue
 */
IssuesDataController.prototype.createIssue = function* (options) {
	options = options || {};
	_.extend(options, {token: this.token});
	return yield* this._githubApi.createIssue(options);
};

/**
 * Edit issue
 * @param {Object} options edit settings
 * @param {Number} [options.number] number of issue
 * @param {String} [options.title] title of issue
 * @param {String} [options.body] body of issue
 * @param {Array} [options.labels] labels names (required)
 * @param {String} [options.state] state of issue
 * @returns {Object} edited issue
 */
IssuesDataController.prototype.editIssue = function* (options) {
	options = options || {};
	_.extend(options, {token: this.token});
	return yield* this._githubApi.editIssue(options);
};

module.exports = IssuesDataController;