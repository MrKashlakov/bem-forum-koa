var CommentViewController = function (settings) {
	if (settings) {
		this._init(settings);
	}
};

CommentViewController.prototype._init = function (settings) {
	this.router = settings.router;
	if (this.router) {
		this.router.get('/issues/:issueId/comments', this._getComments);
		this.router.get('/issues/:issueId/comments/:commentId', this._getComment);
		this.router.post('/issues/:issueId/comments', this._createComment);
		this.router.post('/issues/:issueId/comments/:commentId', this._editComment);
	}
};

CommentViewController.prototype._getComments = function* (next) {
	console.log('GET COMMENTS ACTION');
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