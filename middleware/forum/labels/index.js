var _ = require('underscore');
var LabelsDataController = require('./data-layer');

var LabelViewController = function (settings) {
	this.options = settings;
	this._init();
};

LabelViewController.prototype._init = function () {
	this.router = this.options.router;
	if (this.router) {
		this.router.get('/labels', this._getLabels());
	}
	this._labelsDataController = new LabelsDataController(this.options);
};

LabelViewController.prototype._getLabels = function () {
	var _this = this;
	return function* (next) {
		var token = this.cookies.get('forum_token');

		_this._labelsDataController.setToken(token);

		var labels = yield* _this._labelsDataController.getLabels();

		if (this.request.isXhr) {
			this.bem = {
				templateCtx: {
					block: 'forum-labels',
					mods: {
						view: this.request.query.view
					}
				},
				data: labels,
				addHtmlToJsonResult: false
			};
		}

		return yield* next;
	};
};

LabelViewController.prototype.getRouter = function () {
	return this.router || {};
};

module.exports = LabelViewController;