var co = require('co');
var _ = require('underscore');
var CronJob = require('cron').CronJob;
var viewUtils = require('../utils/view-utils');
var AuthDataLayer = require('../auth/data-layer');
var LabelsDataLayer = require('../labels/data-layer');

/**
 * Initialization forum middleware class
 * @param {Object} options application settings
 * @constructor
 */
var InitController = function (options) {
	this.options = options || {};
	this._authDataLayer = new AuthDataLayer(options);
	this._labelsDataLayer = new LabelsDataLayer(options);
	this._labelsJob = new CronJob({
		cronTime: '0 0 */1 * * *',
		onTick: function () {
			var _this = this;
			_this._labelsDataLayer.setToken();
			co(function* () {
				yield* _this._labelsDataLayer.getLabels({rewriteCache: true});
			}).catch(function (err) {
				console.log(err);
			});
		},
		start: false,
		context: this
	});
	this._labelsJob.start();
};

/**
 * Initialize forum middleware. Save data to koa application context
 * @returns {Object} application context
 */
InitController.prototype.initStaticData = function* (options) {
	var staticData = {};
	this._setLocale(staticData, this.options.defaultLanguage);
	this._initViewBag(staticData, _.extend({}, this.options, {csrf: options.csrf}));
	this._initTitle(staticData, options.lang);
	this._detectXhrRequests(staticData, options.requestType);
	yield* this._loadData(staticData, options.loadSettings);
	return staticData;
};

/**
 * Initialize struct for access to server data form templates
 * @param  {Object} options application settings
 */
InitController.prototype._initViewBag = function (staticData, options) {
	var viewBag = {};
	viewBag.__data = {};
	viewBag.__data.forum = {};
	_.extend(viewBag, {
		forumUrl: options.forumUrl + '/',
		labelsRequired: options.labelsRequired,
		util: viewUtils,
		csrf: options.csrf
	});
	_.extend(viewBag.__data.forum, {
		global: {
			debug: true
		}
	})
	_.extend(staticData, {viewBag: viewBag});
};

InitController.prototype._detectXhrRequests = function (staticData, requestType) {
	var isXhr = false;
	if (requestType && requestType === 'XMLHttpRequest') {
		isXhr = true;
	}
	_.extend(staticData, {request: {isXhr: isXhr}});
};

InitController.prototype._loadData = function* (staticData, settings) {
	var data = {session: {}};
	if (!settings.session.user && settings.token) {
		this._authDataLayer.setToken(settings.token);
		data.session.user = yield* this._authDataLayer.getAuthUser();
	} else {
		data.session.user = settings.session.user;
	}

	this._labelsDataLayer.setToken(settings.token);
	data.session.labels = yield* this._labelsDataLayer.getLabels();
	_.extend(staticData, data);
	_.extend(staticData.viewBag.__data.forum, {
		user: data.session.user || {},
		labels: data.session.labels
	});
}

/**
 * Initialize I18N title
 */
InitController.prototype._initTitle = function (staticData) {
	var i18nTitle = {
		ru: {title: 'Форум / БЭМ. Блок, Элемент, Модификатор'},
		en: {title: 'Forum / BEM. Block, Element, Modifier'}
	};

	var lang = staticData.lang;

	var isSupportedLang = lang ? ['ru', 'en'].some(function (supportedLang) {
		return supportedLang === lang;
	}) : false;

	_.extend(staticData.viewBag.__data, {title: isSupportedLang ? i18nTitle[lang].title : ''});; 
	return staticData;
};

InitController.prototype._setLocale = function (staticData, defaultLanguage) {
	_.extend(staticData, {lang: defaultLanguage});
};

module.exports = InitController;