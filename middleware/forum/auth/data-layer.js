var _ = require('underscore');

var GithubApiController = require('../github');

/**
 * Constructor for auth data controller
 * @param {Object} options application settings
 * @constructor
 */
var AuthDataController = function (options) {
	this.options = options || {};
	this._githubApi = new GithubApiController(options);
};

/**
 * Set auth token for controller instance
 * @param {String} token auth token
 */
AuthDataController.prototype.setToken = function (token) {
	if (token) {
		this.token = token;
		this._githubApi.addUserAPI(token);
	} else {
		delete this.token;
		this._githubApi.addDefaultAPI();
	}
}

/**
 * Return auth user
 * @returns {Object} auth user
 */
AuthDataController.prototype.getAuthUser = function* () {
	var options = {token: this.token};
	return yield* this._githubApi.getAuthUser(options);
};

module.exports = AuthDataController;