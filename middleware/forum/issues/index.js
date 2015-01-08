var IssueViewController = function (settings) {
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
		this.router.get('/issues/', this._getIssues);
		this.router.get('/issues/:issueId', this._getIssue);
		this.router.post('/issues/', this._createIssue);
		this.router.post('/issues/:issueId', this._editIssue);	
	}
};

/**
 * Get issues action
 */
IssueViewController.prototype._getIssues = function* (next) {
	console.log('GET ISSUES ACTION');
};

/**
 * Get issue by param
 */
IssueViewController.prototype._getIssue = function* (next) {
	console.log('GET ISSUE ACTION');
};

/**
 * Create new issue
 */
IssueViewController.prototype._createIssue = function* (next) {
	console.log('CREATE ISSUE ACTION');
};

/**
 * Edit selected issue
 */
IssueViewController.prototype._editIssue = function* (next) {
	console.log('EDIT ISSUES ACTIION');
};

/**
 * Get controller router
 * @return {Object}
 */
IssueViewController.prototype.getRouter = function () {
	return this.router || {};
}


module.exports = IssueViewController;