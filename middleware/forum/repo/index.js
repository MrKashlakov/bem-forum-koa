var RepoViewController = function (settings) {
	if (settings) {
		this._init(settings);
	}
};

RepoViewController.prototype._init = function (settings) {
	this.router = settings.router;
	if (this.router) {
		this.router.get('repo', this._getRepoInfo);
	}
};

RepoViewController.prototype._getRepoInfo = function* (next) {
	console.log('GET REPO INFO ACTION');
};

RepoViewController.prototype.getRouter = function () {
	return this.router || {};
};

module.exports = RepoViewController;