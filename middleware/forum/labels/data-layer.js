var _ = require('underscore');
var cache = require('memory-cache');

var POOLING_INTERVAL = 10000;

var GithubApiController = require('../github');

/**
 * Contructor for labels data controller
 * @param {Object} options applicaion settings
 */
var LabelsDataController = function (options) {
	this.options = options || {};
	this._githubApi = new GithubApiController(options);
};

/**
 * Set auth token
 * @param {String} token auth token
 */
LabelsDataController.prototype.setToken = function (token) {
	if (token) {
		this.token = token;
		this._githubApi.addUserAPI(token);
	} else {
		delete this.token;
		this._githubApi.addDefaultAPI();
	}
};

/**
 * Get labels form repository
 * @param {Object} options get params
 * @param {String} [options.token] auth token
 * @returns {Array} array of labels
 */
LabelsDataController.prototype._fetchLabels = function* (options) {
	options = options || {};

	var labels = yield* this._githubApi.getLabels(options);
	labels = labels || {};

	labels = labels.filter(function (label) {
		return label.name !== 'removed';
	});

	labels = labels.sort(function (a, b) {
		if (a.name === b.name) return 0;
		return a.name > b.name ? 1 : -1;
	});

	return labels;

};

/**
 * Get repository labels
 * @param {Object} settings settings for getting labels
 * @param {Boolean} [settings.rewriteCache] rewrite cached labels
 * @returns {Array} array of labels
 */
LabelsDataController.prototype.getLabels = function* (settings) {
	settings = settings || {};
	var labels = cache.get('labels');
	if (!labels || settings.rewriteCache) {
		var options = {token: this.token};
		labels = yield* this._fetchLabels(options);
		cache.del('labels');
		cache.put('labels', labels);
	}

	return labels;
};

module.exports = LabelsDataController;