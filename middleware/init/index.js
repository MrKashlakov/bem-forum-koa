var _ = require('underscore');

var DataAccessLayer = require('../data-access-layer');


var initController = {

	initViewBag: function (options) {
		this.viewBag = {};
		this.viewBag.__data = {};

		this.viewBag = _.extend(this.viewBag, {
			forumUrl: options.forumUrl + '/',
			labelsRequired: options.labelsRequired,
			util: require('./view-utils'),
			csrf: ''
		});
	},

	initTitle: function () {
		var i18n = {
			ru: {
				title: 'Форум / БЭМ. Блок, Элемент, Модификатор'
			},
			en: {
				title: 'Forum / BEM. Block, Element, Modifier'
			}
		};

		var lang = this.lang;

		var isLangSupport = lang ? ['ru', 'en'].some(function (supportLanguage) {
			return supportLanguage === lang;
		}) : false;

		this.viewBag.__data.title = isLangSupport ? i18n[lang].title : '';
	},

	initData: function* (options) {
		var token = this.cookies.get('forum_token');
		var dataAccess = new DataAccessLayer(options, token);

		if (!this.session.user && token) {
			this.session.user = yield dataAccess.getAuthUser();
		}

		if (!this.session.labels) {
			this.session.labels = yield dataAccess.getLabels();
		}
	},

	detectXhrRequest: function() {
		var xhrHeaderValue = this.request.get('X-Requested-With')
		if (xhrHeaderValue && xhrHeaderValue === 'XMLHttpRequest') {
			this.request.isXhr = true;
		}
	}
};

module.exports = function (options) {
	return function* (next) {

		initController.detectXhrRequest.call(this);

		initController.initViewBag.call(this, options);
		initController.initTitle.call(this);
		yield initController.initData.call(this, options);

		return yield next;
	};
}