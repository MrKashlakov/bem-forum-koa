var _ = require('underscore');
var TemplateController = require('./template');

module.exports = function (options) {
	return function* (next) {
		var template = new TemplateController(options);

		if (this.request.isXhr) {
			if (this.bem) {
				var html = yield template.run(_.extend(this.bem.templateCtx || {}, {data: this.bem.data}), this);
				if (this.bem.addHtmlToJsonResult) {
					var result = this.bem.resultObject || {};
					result.html = html;
					this.body = result;
				} else {
					this.body = html;
				}
			}
		} else {
			var html = yield template.run(_.extend({block: 'page'}, this.viewBag.__data), this);
			/*template.run(_.extend({block: 'page'}, this.viewBag.__data), this).then(function (html) {
				console.log(html);
			}).fail(function (err) {
				console.log(err.stack);
			});*/
			this.body = html;
		}
	};
};