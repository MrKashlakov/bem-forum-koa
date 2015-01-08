var UserViewController = function (settings) {
	if (settings) {
		this._init(settings);
	}
};

UserViewController.prototype._init = function (settings) {
	this.router = settings.router;
	if (this.router) {
		this.router.get('/user', this._getAuthUser)
	}
};

UserViewController.prototype._getAuthUser = function* (next) {
	console.log('GET AUTH USER ACTION');
};

UserViewController.prototype.getRouter = function () {
	return this.router || {};
};

module.exports = UserViewController;