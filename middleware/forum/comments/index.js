var DataAccessLayer = require('../../data-access-layer');

var CommentViewController = function (settings) {
	this.options = settings || {};
	if (settings) {
		this._init(settings);
	}
};

CommentViewController.prototype._init = function (settings) {
	this.router = settings.router;
	if (this.router) {
		this.router.get('/issues/:issueId/comments', this._getComments());
		this.router.post('/issues/:issueId/comments', this._createComment());
		this.router.post('/issues/:issueId/comments/:commentId', this._editComment());
		this.router.del('/issues/:issueId/comments/:commentId', this._deleteComment());
	}
};

CommentViewController.prototype._getComments = function () {
	var _this = this;
	return function* (next) {
		if (this.request.isXhr) {
			var token = this.cookies.get('forum_token');
			var number = this.params.issueId;
			var dataLayer = new DataAccessLayer(_this.options, token);

			var comments = yield* dataLayer.getComments({
				options: {
					number: number
				}
			});

			this.bem = {
				templateCtx: {
					block: 'comments',
					mods: {
						view: 'close'
					},
					issueNumber: number,
					forumUrl: this.viewBag.forumUrl
				},
				data: comments,
				addHtmlToJsonResult: false
			};
		}
		return yield* next;
	}
};

CommentViewController.prototype._createComment = function () {
	var _this = this;
	return function* (next) {
		if (this.request.isXhr) {
			var token = this.cookies.get('forum_token');
			var number = this.params.issueId;
			var body = this.request.body.body;
			var dataLayer = new DataAccessLayer(_this.options, token);

			var comment = yield* dataLayer.createComment({
				options: {
					number: number,
					body: body
				}
			});

			this.bem = {
				templateCtx: {
					block: 'comment',
					issueNumber: number,
					forumUrl: this.viewBag.forumUrl
				},
				data: comment,
				addHtmlToJsonResult: false
			};
		}
		return yield* next;
	}
};

CommentViewController.prototype._editComment = function () {
	var _this = this;
	return function* (next) {
		if (this.request.isXhr) {
			var token = this.cookies.get('forum_token');
			var issueId = this.params.issueId;
			var commentId = this.params.commentId;
			var body = this.request.body.body;
			var dataLayer = new DataAccessLayer(_this.options, token);

			var comment = yield* dataLayer.editComment({
				options: {
					id: commentId,
					body: body 
				}
			});

			this.bem = {
				templateCtx: {
					block: 'comment',
					issueNumber: issueId,
					forumUrl: this.viewBag.forumUrl,
				},
				data: comment,
				addHtmlToJsonResult: false
			};
		}
		return yield* next;
	};
};

CommentViewController.prototype._deleteComment = function () {
	var _this = this;
	return function* (next) {
		if (this.request.isXhr) {
			var token = this.cookies.get('forum_token');
			var issueId = this.params.issueId;
			var commentId = this.params.commentId;
			var dataLayer = new DataAccessLayer(_this.options, token);

			var result = yield* dataLayer.deleteComment({
				options: {
					id: commentId
				}
			});

			this.status = 204;
		}
	};
}

CommentViewController.prototype.getRouter = function () {
	return this.router || {};
};

module.exports = CommentViewController;