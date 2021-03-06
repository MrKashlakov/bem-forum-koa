var thunkify = require('thunkify');

var AuthController = require('./auth');
var AuthDataController = require('./data-layer');

var AuthViewController = function (settings) {
	this.options = settings || {};
	this._init();
};

AuthViewController.prototype._init = function () {
	this.router = this.options.router;
	if (this.router) {
		this.router.get('/auth', this._sendAuthRequest());
		this.router.get('/auth/callback', this._authCallback());
	}
	this._authDataController = new AuthDataController(this.options);
};

AuthViewController.prototype._authCallback = function () {
	var _this = this;
	return function* (next) {
		var auth = new AuthController(_this.options);
		var code = this.request.query.code;
		if (code) {
			var oAuth = auth.getOAuth(this.request.host);
			var access = yield thunkify(oAuth.getOAuthAccessToken).call(oAuth, code, {});

			if (access) {
				var accessToken = access[0];

				_this._authDataController.setToken(accessToken);

				var user = yield* _this._authDataController.getAuthUser();

				var expires = new Date(Date.now() + (86400000 * 5)); // 5 days

				this.cookies.set('forum_token', accessToken, {expires: expires});
				this.cookies.set('forum_username', user.login, {expires: expires});

				this.status = 303;
				this.set('Location', auth.getRedirectUrl(this.request.host));
			}
		}
	}
};

AuthViewController.prototype._sendAuthRequest = function () {
	var _this = this;
	return function* (next) {
		var auth = new AuthController(_this.options);

		this.status = 303;
		this.set('Location', auth.getOAuth(this.request.host).getAuthorizeUrl({
			redirect_url: auth.getRedirectUrl(this.request.host),
			scope: 'public_repo'
		}));
	};
}

AuthViewController.prototype.getRouter = function () {
	return this.router || {};
}

module.exports = AuthViewController;