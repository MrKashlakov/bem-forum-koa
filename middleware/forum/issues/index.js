var _ = require('underscore');

var DataAccessLayer = require('../../data-access-layer');

var  IssueViewController = function (settings) {
	 this.options = settings || {};
	if (settings) {
		this._init(settings);
	}
}

/**
 * Initialze issue view controller
 * @param  {Object} settings init options
 */
IssueViewController.prototype._init = function (settings) {
	this.router = settings.router;
	if (this.router) {
		this.router.get('/', this._getIssues());
		this.router.get('/issues/', this._getIssues());
		this.router.get('/issues/:issueId', this._getIssue());
		this.router.post('/issues/', this._createIssue());
		this.router.post('/issues/:issueId', this._editIssue());	
	}
};

/**
 * Get issues action
 */
IssueViewController.prototype._getIssues = function () {
	var _this = this;
	return function* (next) {
		var options = {};
		var page = this.request.query.page;
		var labels = this.request.query.labels;
		var sort = this.request.query.sort;
		var direction = this.request.query.direction;

		if (page) {
			_.extend(options, {page: page});
		};

		if (labels) {
			_.extend(options, {labels: labels});
		}

		if (sort && direction) {
			_.extend(options, {
				sort: sort,
				direction: direction
			});
		}

		var token = this.cookies.get('forum_token');
		var dataLayer = new DataAccessLayer(_this.options, token);
		var issues = yield dataLayer.getIssues(options);

		if (this.request.isXhr) {
			if (this.request.query.__mode === 'json') {
				this.body = issues;
			} else {
				this.bem = {
					templateCtx: {
						block: 'forum-issues'
					},
					data: issues,
					addHtmlToJsonResult: true,
					resultObject: {
						isLastPage: (!issues.length || issues.length < 10)
					}
				};
			}
		} else {
			var forum = {
				user: this.session.user || {},
				labels: this.session.labels,
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

		return yield* next;
	};
};

/**
 * Get issue by number
 */
IssueViewController.prototype._getIssue = function () {
	var _this = this;
	return function* (next) {
		var token = this.cookies.get('forum_token');
		var number = this.params.issueId;
		var dataLayer = new DataAccessLayer(_this.options, token);

		var issue = yield* dataLayer.getIssue(number);

		var comments = yield* dataLayer.getComments({
			options: {
				number: number
			}
		});

		var forum = {
			user: this.session.user || {},
			labels: this.session.labels,
			issue: issue,
			comments: comments,
			view: 'issue',
			global: {
				debug: true
			}
		};

		_.extend(this.viewBag.__data, {
			forum: forum
		});

		return yield* next;
	};
};

/**
 * Create new issue
 */
IssueViewController.prototype._createIssue = function () {
	var _this = this;
	return function* (next) {
		var token = this.cookies.get('forum_token');
		var dataLayer = new DataAccessLayer(_this.options, token);

		var result = yield* dataLayer.createIssue({
			options: {
				labels: [],
				title: this.request.body.title,
				body: this.request.body.body
			}
		});

		if (this.request.query.__mode === 'json') {
			this.body = result;
		} else {
			return yield* next;
		}
	}
};

/**
 * Edit selected issue
 */
IssueViewController.prototype._editIssue = function () {
	var _this = this;
	return function* (next) {
		var token = this.cookies.get('forum_token');
		var ownerToken = _this.options.owner_token;
		var access = this.request.query.__access;

		if (access === 'owner' && ownerToken) {
			token = ownerToken;
		};

		var dataLayer = new DataAccessLayer(_this.options, token);
		var options = _.omit(this.request.body, '_csrf');

		if (!options.labels || !ownerToken) {
			options.labels = [];
		}

		var result = yield* dataLayer.editIssue({
			options: options
		});

		if (this.request.isXhr) {
			this.bem = {
				templateCtx: {
					block: 'issue',
					forumUrl: this.viewBag.forumUrl,
					labelsRequired: this.viewBag.labelsRequired,
					csrf: this.viewBag.csrf
				},
				data: result,
				addHtmlToJsonResult: false
			};
		}

		return yield* next;
	}
};

/**
 * Get controller router
 * @return {Object}
 */
IssueViewController.prototype.getRouter = function () {
	return this.router || {};
}


module.exports = IssueViewController;