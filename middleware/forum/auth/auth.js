var _ = require('underscore');
var OAuth2 = require('oauth').OAuth2;

	var AuthController = function (options) {
	this.options = options || {};
	this._init();
};

AuthController.prototype._init = function () {
	var _this = this;
	_this.oauth = (function () {
		var config = _this.options.oauth;

		if (!config || !_.isObject(config) || _.isEmpty(config)) {
			throw new Error('Invalid oauth configuration');
		}

		if (config.clientId && config.secret) {
			return _this._createOAuth(config.clientId, config.secret);
		}
		return Object.keys(config).reduce(function (prev, key) {
			prev[key] = _this._createOAuth(config[key]['clientId'], config[key]['secret']);
			return prev;
		}, {});
	})();
};


AuthController.prototype._createOAuth = function (id, secret) {
	return new OAuth2(id, secret,
		'https://github.com/',
		'login/oauth/authorize',
		'login/oauth/access_token');
};

AuthController.prototype.getOAuth = function (host) {
	var result = this.oauth[host] || this.oauth;
	return result;
};

AuthController.prototype.getRedirectUrl = function (host) {
	return this.options.oauth[host].redirectUrl;
};

module.exports = AuthController;