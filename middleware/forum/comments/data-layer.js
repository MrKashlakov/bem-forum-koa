var _ = require('underscore');
var GithubApiController = require('../github');

/**
 * Constructor of comments data controller
 * @param {Object} options application settings
 */
var CommentsDataController = function (options) {
	this.options = options || {};
	this._githubApi = new GithubApiController(options);
};

/**
 * Set auth token to API
 * @param {String} token auth token
 */
CommentsDataController.prototype.setToken = function (token) {
	if (token) {
		this.token = token;
		this._githubApi.addUserAPI(token);
	} else {
		delete this.token;
		this._githubApi.addDefaultAPI();
	}
};

/**
 * Get all comments for issue
 * @param {Object} options api params
 * @param {Number} [options.number] number of issue
 * @param {Number} [options.page] number of page for pagination
 * @param {Number} [options.per_page] number of comments per one page
 * @returns {Array} list of comments
 */
CommentsDataController.prototype.getComments = function* (options) {
	options = options || {};
	_.extend(options, {token: this.token});
	return yield this._githubApi.getComments(options);
};

/**
 * Create new comment for issue
 * @param {Object} options creation params
 * @param {Number} [options.number] number of issue
 * @param {String} [options.body] body of comment
 * @returns {Object} new comment
 */
CommentsDataController.prototype.createComment = function* (options) {
	options = options || {};
	_.extend(options, {token: this.token});
	return yield* this._githubApi.createComment(options);
};

/**
 * Edit comment for issue
 * @param {Object} options edit params
 * @param {Number} [options.id] unique id of comment
 * @param {String} [options.body] body of comment
 * @returns {Object} edited comment
 */
CommentsDataController.prototype.editComment = function* (options) {
	options = options || {};
	_.extend(options, {token: this.token});
	return yield* this._githubApi.editComment(options);
};

/**
 * Delete comment for issue
 * @param {Object} options delete params
 * @param {Number} [options.id] unique id of comment
 * @returns {Object} operation result
 */
CommentsDataController.prototype.deleteComment = function* (options) {
	options = options || {};
	_.extend(options, {token: this.token});
	return yield* this._githubApi.deleteComment(options);
};


module.exports = CommentsDataController;