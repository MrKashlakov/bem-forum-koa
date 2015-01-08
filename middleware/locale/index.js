module.exports = function (defaultLanguage) {
	return function* (next) {
		this.lang = defaultLanguage;
		return yield next;
	};
}