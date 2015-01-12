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
		this.router.get('/issues/:issueId/comments/:commentId', this._getComment);
		this.router.post('/issues/:issueId/comments', this._createComment);
		this.router.post('/issues/:issueId/comments/:commentId', this._editComment);
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

CommentViewController.prototype._getComment = function* (next) {
	console.log('GET COMMENT ACTION');
};

CommentViewController.prototype._createComment = function* (next) {
	console.log('CREATE COMMENT ACTION');
};

CommentViewController.prototype._editComment = function* (next) {
	console.log('EDIT COMMENT ACTION')
}

CommentViewController.prototype.getRouter = function () {
	return this.router || {};
};

module.exports = CommentViewController;