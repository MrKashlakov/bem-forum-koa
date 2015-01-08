var LabelViewController = function (settings) {
	if (settings) {
		this._init(settings);
	}
};

LabelViewController.prototype._init = function (settings) {
	this.router = settings.router;
	if (this.router) {
		this.router.get('/labels', this._getLabels);
	}
};

LabelViewController.prototype._getLabels = function* (next) {
	console.log('GET LABELS ACTION');
};

LabelViewController.prototype.getRouter = function () {
	return this.router || {};
};

module.exports = LabelViewController;