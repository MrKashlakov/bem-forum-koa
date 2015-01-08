var _ = require('underscore');

module.exports = function (options) {
	return function* (next) {
		this.viewBag = {};
		this.viewBag.__data = {};

		this.viewBag = _.extend(this.viewBag, {
			forumUrl: options.forumUrl + '/',
			labelsRequired: options.labelsRequired,
			util: require('./view-utils'),
			csrf: ''
		});

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

		return yield next;
	};
}